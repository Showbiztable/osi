package io.github.showbiztable.osi.acesso;

import static java.nio.charset.StandardCharsets.UTF_8;

import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class AcessoDemoController {

	static final String ROTA_ENTRADA = "/api/acesso";
	static final String ROTA_SAUDE = "/api/saude";
	static final String ROTA_PRONTIDAO = "/api/prontidao";
	private static final int LIMITE_INATIVIDADE_EM_SEGUNDOS = 10 * 60;
	private static final int LIMITE_VALIDACAO_CONEXAO_EM_SEGUNDOS = 2;
	private final String codigoConfigurado;
	private final DataSource dataSource;
	private final LimitadorTentativasAcesso limitador = new LimitadorTentativasAcesso(System::nanoTime);

	AcessoDemoController(@Value("${osi.demo.codigo:}") String codigoConfigurado, DataSource dataSource) {
		this.codigoConfigurado = codigoConfigurado;
		this.dataSource = dataSource;
	}

	@GetMapping(ROTA_SAUDE)
	ResponseEntity<Void> verificarDisponibilidade() {
		return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
	}

	@GetMapping(ROTA_PRONTIDAO)
	ResponseEntity<Void> verificarProntidao() {
		boolean pronta;
		try (Connection conexao = dataSource.getConnection()) {
			pronta = conexao.isValid(LIMITE_VALIDACAO_CONEXAO_EM_SEGUNDOS);
		} catch (SQLException erro) {
			pronta = false;
		}
		HttpStatus status = pronta ? HttpStatus.NO_CONTENT : HttpStatus.SERVICE_UNAVAILABLE;
		return ResponseEntity.status(status).cacheControl(CacheControl.noStore()).build();
	}

	@PostMapping(ROTA_ENTRADA)
	ResponseEntity<Void> entrar(@RequestBody DadosAcesso dados, HttpServletRequest requisicao) {
		String codigoRecebido = dados.codigo();
		boolean codigoValido = !codigoConfigurado.isBlank() && codigoRecebido != null
			&& MessageDigest.isEqual(codigoConfigurado.getBytes(UTF_8), codigoRecebido.getBytes(UTF_8));
		long segundosDeEspera = limitador.registrarTentativa(requisicao.getRemoteAddr(), codigoValido);
		if (segundosDeEspera > 0) {
			return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
				.header(HttpHeaders.RETRY_AFTER, Long.toString(segundosDeEspera))
				.build();
		}
		if (!codigoValido) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		HttpSession sessao = requisicao.getSession();
		requisicao.changeSessionId();
		sessao.setMaxInactiveInterval(LIMITE_INATIVIDADE_EM_SEGUNDOS);
		sessao.setAttribute(ConfiguracaoSessaoDemo.SESSAO_AUTENTICADA, true);
		return ResponseEntity.noContent().build();
	}

	record DadosAcesso(String codigo) {}
}
