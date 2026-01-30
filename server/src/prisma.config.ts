import { defineConfig } from '@prisma/config';

export default defineConfig({
  // Aponta para onde está seu schema (saindo da pasta src)
  schema: '../prisma/schema.prisma',
  
  // Define a URL do banco aqui
  datasource: {
    url: process.env.DATABASE_URL,
  },
});