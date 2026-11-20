package io.github.showbiztable.osi.acesso;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration(proxyBeanMethods = false)
public class ConfiguracaoSessaoDemo {

	public static final String SESSAO_AUTENTICADA = "osi.demo.sessaoAutenticada";

	@Bean
	FilterRegistrationBean<FiltroSessaoDemo> filtroSessaoDemo() {
		FilterRegistrationBean<FiltroSessaoDemo> registro = new FilterRegistrationBean<>(new FiltroSessaoDemo());
		registro.addUrlPatterns("/api/*");
		return registro;
	}

	private static class FiltroSessaoDemo extends OncePerRequestFilter {

		@Override
		protected void doFilterInternal(HttpServletRequest requisicao, HttpServletResponse resposta, FilterChain cadeia)
			throws ServletException, IOException {
			HttpSession sessao = requisicao.getSession(false);
			if (sessao == null || !Boolean.TRUE.equals(sessao.getAttribute(SESSAO_AUTENTICADA))) {
				resposta.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
				return;
			}

			cadeia.doFilter(requisicao, resposta);
		}
	}
}
