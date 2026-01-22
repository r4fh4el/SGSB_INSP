/**
 * Cliente para API Open-Meteo
 * Busca dados meteorológicos incluindo pluviosidade
 */

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    rain: number;
    showers: number;
  };
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    precipitation: string;
    rain: string;
    showers: string;
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
  };
  daily_units: {
    time: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
  };
}

/**
 * Busca dados meteorológicos da API Open-Meteo
 * @param latitude Latitude em graus decimais
 * @param longitude Longitude em graus decimais
 * @returns Dados meteorológicos incluindo pluviosidade
 */
export async function buscarDadosMeteorologicos(
  latitude: number,
  longitude: number
): Promise<OpenMeteoResponse> {
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    throw new Error("Latitude e longitude devem ser números válidos");
  }

  const baseUrl = "https://api.open-meteo.com/v1/forecast";
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: "America/Sao_Paulo",
    current: "temperature_2m,relative_humidity_2m,precipitation,rain,showers",
    forecast_days: "1",
    daily: "precipitation_sum,rain_sum,showers_sum",
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000), // 15 segundos de timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Open-Meteo retornou erro ${response.status}: ${errorText}`
      );
    }

    const data: OpenMeteoResponse = await response.json();

    if (!data || !data.current) {
      throw new Error(
        "A resposta da API Open-Meteo não contém dados válidos"
      );
    }

    return data;
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error(
        "Timeout: A requisição à API Open-Meteo excedeu 15 segundos"
      );
    }
    if (error.message) {
      throw error;
    }
    throw new Error(
      `Erro ao buscar dados da API Open-Meteo: ${error.message || "Erro desconhecido"}`
    );
  }
}

/**
 * Calcula coordenadas em um raio de 1km a oeste da barragem (área a montante)
 * @param latitude Latitude da barragem
 * @param longitude Longitude da barragem
 * @param raioKm Raio em quilômetros (padrão: 1km)
 * @param numPontos Número de pontos a buscar (padrão: 5)
 * @returns Array de coordenadas {latitude, longitude}
 */
export function calcularPontosMontante(
  latitude: number,
  longitude: number,
  raioKm: number = 1.0,
  numPontos: number = 5
): Array<{ latitude: number; longitude: number }> {
  const pontos: Array<{ latitude: number; longitude: number }> = [];

  // Converter latitude e longitude para números
  const lat = parseFloat(latitude.toString());
  const lon = parseFloat(longitude.toString());

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error("Latitude e longitude devem ser números válidos");
  }

  // Aproximação: 1 grau de latitude ≈ 111 km
  // 1 grau de longitude ≈ 111 km * cos(latitude)
  const grausPorKmLat = 1 / 111.0;
  const grausPorKmLon = 1 / (111.0 * Math.cos((lat * Math.PI) / 180));

  // Criar pontos em um círculo a oeste (longitude negativa) - área a montante
  // Distribuir pontos em um semicírculo a oeste
  for (let i = 0; i < numPontos; i++) {
    // Ângulo de 0 a 180 graus (oeste)
    const angulo = (i * Math.PI) / (numPontos - 1 || 1);
    
    // Distância do centro (0 a raioKm)
    const distancia = raioKm * (0.3 + (i / numPontos) * 0.7); // Distribuir de 30% a 100% do raio
    
    // Calcular deslocamento em graus
    const deltaLat = distancia * grausPorKmLat * Math.sin(angulo);
    const deltaLon = distancia * grausPorKmLon * Math.cos(angulo);

    pontos.push({
      latitude: lat + deltaLat,
      longitude: lon - deltaLon, // Sempre a oeste (negativo) - área a montante
    });
  }

  return pontos;
}

/**
 * Busca pluviosidade média de múltiplos pontos a oeste da barragem (área a montante)
 * @param latitude Latitude da barragem
 * @param longitude Longitude da barragem
 * @param raioKm Raio em quilômetros (padrão: 1km)
 * @param numPontos Número de pontos a buscar (padrão: 5)
 * @returns Pluviosidade média em mm
 */
export async function buscarPluviosidadeMediaMontante(
  latitude: number,
  longitude: number,
  raioKm: number = 1.0,
  numPontos: number = 5
): Promise<{
  precipitacaoMedia: number;
  precipitacaoAtual: number;
  precipitacaoTotalDia: number;
  pontosConsultados: number;
  pontosComSucesso: number;
  dados: Array<{
    latitude: number;
    longitude: number;
    precipitacao: number;
    precipitacaoTotalDia: number;
  }>;
}> {
  const pontos = calcularPontosMontante(latitude, longitude, raioKm, numPontos);
  const dados: Array<{
    latitude: number;
    longitude: number;
    precipitacao: number;
    precipitacaoTotalDia: number;
  }> = [];

  let somaPrecipitacao = 0;
  let somaPrecipitacaoTotal = 0;
  let pontosComSucesso = 0;

  // Buscar dados de cada ponto
  for (const ponto of pontos) {
    try {
      const dadosMeteo = await buscarDadosMeteorologicos(
        ponto.latitude,
        ponto.longitude
      );

      const precipitacao = dadosMeteo.current.precipitation || 0;
      const precipitacaoTotalDia =
        dadosMeteo.daily.precipitation_sum?.[0] || 0;

      dados.push({
        latitude: ponto.latitude,
        longitude: ponto.longitude,
        precipitacao,
        precipitacaoTotalDia,
      });

      somaPrecipitacao += precipitacao;
      somaPrecipitacaoTotal += precipitacaoTotalDia;
      pontosComSucesso++;
    } catch (error) {
      console.error(
        `Erro ao buscar dados para ponto (${ponto.latitude}, ${ponto.longitude}):`,
        error
      );
      // Continuar com os outros pontos mesmo se um falhar
    }
  }

  if (pontosComSucesso === 0) {
    throw new Error(
      "Não foi possível obter dados de pluviosidade de nenhum ponto"
    );
  }

  const precipitacaoMedia = somaPrecipitacao / pontosComSucesso;
  const precipitacaoTotalMedia = somaPrecipitacaoTotal / pontosComSucesso;

  return {
    precipitacaoMedia,
    precipitacaoAtual: precipitacaoMedia,
    precipitacaoTotalDia: precipitacaoTotalMedia,
    pontosConsultados: pontos.length,
    pontosComSucesso,
    dados,
  };
}

