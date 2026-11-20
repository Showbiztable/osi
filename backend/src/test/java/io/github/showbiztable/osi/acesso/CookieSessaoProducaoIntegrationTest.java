package io.github.showbiztable.osi.acesso;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;

@Tag("integration")
@ActiveProfiles("producao")
@SpringBootTest(
	webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
	properties = { "server.address=127.0.0.1", "osi.demo.codigo=" + CookieSessaoProducaoIntegrationTest.CODIGO_DE_TESTE }
)
class CookieSessaoProducaoIntegrationTest {

	static final String CODIGO_DE_TESTE = "codigo-ficticio-para-teste-de-cookie";

	@LocalServerPort
	private int porta;

	@Test
	void protege_O_Cookie_Da_Sessao_Em_Producao() throws Exception {
		// Given
		HttpRequest requisicao = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + porta + "/api/acesso"))
			.header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
			.POST(HttpRequest.BodyPublishers.ofString("""
				{"codigo": "%s"}
				""".formatted(CODIGO_DE_TESTE)))
			.build();

		// When
		HttpResponse<Void> resposta;
		try (HttpClient cliente = HttpClient.newHttpClient()) {
			resposta = cliente.send(requisicao, HttpResponse.BodyHandlers.discarding());
		}

		// Then
		assertEquals(204, resposta.statusCode());
		String cookie = resposta.headers().firstValue(HttpHeaders.SET_COOKIE)
			.orElseThrow(() -> new AssertionError("A entrada deve enviar um cookie de sessão"));
		List<String> atributos = Arrays.stream(cookie.split(";"))
			.map(atributo -> atributo.strip().toLowerCase(Locale.ROOT))
			.toList();
		assertAll(
			() -> assertTrue(atributos.contains("secure"), "O cookie deve exigir HTTPS"),
			() -> assertTrue(atributos.contains("httponly"), "O cookie deve ficar fora do alcance do JavaScript"),
			() -> assertTrue(atributos.contains("samesite=strict"), "O cookie deve usar SameSite=Strict")
		);
	}
}
