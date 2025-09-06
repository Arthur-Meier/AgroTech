# PVF — Expo/React Native Skeleton

Este esqueleto contém a estrutura base (src/*) e alguns arquivos de config
para você colar em um projeto Expo TypeScript criado via:

```powershell
npx create-expo-app@latest pvf -t expo-template-blank-typescript
```

Depois, copie todo o conteúdo deste ZIP por cima da pasta do projeto criado
(aceite substituir arquivos quando necessário).

## Estrutura

- `src/app` — bootstrap (providers, tema, navegação)
- `src/core` — infraestrutura (db/sqlite, iap/entitlements, http)
- `src/domain` — tipos e portas do domínio
- `src/data` — repositórios concretos
- `src/features` — módulos de features (animals/* como exemplo)
- `src/ui` — design system básico
- `App.tsx` — exporta `src/app` como entrada do Expo
- `app.json`, `babel.config.js`, `tsconfig.json` — configs essenciais

## Telas incluídas (exemplo)
- Lista de Animais (offline) — `features/animals/list/AnimalsScreen.tsx`
- Formulário de Animal — `features/animals/form/AnimalForm.tsx`

## Próximos passos resumidos
1) Criar o app (Expo + TS)
2) Copiar os arquivos deste ZIP
3) Instalar dependências (ver instruções no chat)
4) `npx expo start`


para rodar o projeto
-> npx expo start --web --clear