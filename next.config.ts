import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite o HMR (websocket de dev) quando a app é aberta pelo IP da rede,
  // e não só por localhost. Só afeta o ambiente de desenvolvimento.
  allowedDevOrigins: ["192.168.0.2"],
};

export default nextConfig;
