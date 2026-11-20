package io.github.showbiztable.osi.acesso;

import java.util.LinkedHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.LongSupplier;

final class LimitadorTentativasAcesso {

	private static final int LIMITE_DE_FALHAS = 5;
	private static final int LIMITE_DE_ORIGENS = 1_024;
	private static final long JANELA_EM_NANOS = TimeUnit.MINUTES.toNanos(1);

	private final LinkedHashMap<String, Janela> janelas = new LinkedHashMap<>();
	private final LongSupplier relogioEmNanos;

	LimitadorTentativasAcesso(LongSupplier relogioEmNanos) {
		this.relogioEmNanos = relogioEmNanos;
	}

	synchronized long registrarTentativa(String ip, boolean codigoValido) {
		long agora = relogioEmNanos.getAsLong();
		while (!janelas.isEmpty() && nanosRestantes(janelas.firstEntry().getValue(), agora) <= 0) {
			janelas.pollFirstEntry();
		}

		Janela janela = janelas.get(ip);
		if (janela != null && janela.falhas() >= LIMITE_DE_FALHAS) {
			return segundosRestantes(janela, agora);
		}
		if (codigoValido) {
			return 0;
		}
		if (janela == null && janelas.size() >= LIMITE_DE_ORIGENS) {
			return segundosRestantes(janelas.firstEntry().getValue(), agora);
		}

		Janela atualizada = janela == null
			? new Janela(agora, 1)
			: new Janela(janela.inicio(), janela.falhas() + 1);
		janelas.put(ip, atualizada);
		return 0;
	}

	private static long segundosRestantes(Janela janela, long agora) {
		return Math.ceilDiv(nanosRestantes(janela, agora), TimeUnit.SECONDS.toNanos(1));
	}

	private static long nanosRestantes(Janela janela, long agora) {
		return JANELA_EM_NANOS - (agora - janela.inicio());
	}

	private record Janela(long inicio, int falhas) {}
}
