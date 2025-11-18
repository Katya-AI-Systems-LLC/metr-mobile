# METR Web3 Subsystem (app/web3)

Каталог `app/web3/` содержит высокоуровневую логику интеграции METR с Web3‑экосистемой (кошельки, токены, NFT, DAO, блокчейн‑аудит).

## Файлы и назначение

- `Web3Manager.ts` — основной менеджер Web3‑функций:
  - подключение крипто‑кошельков (через WalletConnect и др. провайдеров);
  - взаимодействие со смарт‑контрактами в каталоге `contracts/` (NFT Achievements, METR Token, DAO, Blockchain Audit Trail);
  - управление сетью (Ethereum/Polygon и совместимые);
  - обработка транзакций и статусов, кэширование и отображение в UI.

## Связь с другими подсистемами

- `contracts/*` — набор Solidity‑контрактов, с которыми работает `Web3Manager`.
- `app/ai/*` — AI‑модули могут использовать Web3‑данные (например, для рекомендаций, геймификации и токен‑экономики).
- `app/productivity/*`, `app/gamification/*` — получают данные о достижениях, NFT, токенах и голосовании.

Дополнительную информацию о Web3‑части см. в:
- `FINAL_IMPLEMENTATION_STATUS.md` (раздел Web3 Integration) 
- `docs/MODERNIZATION_CONCEPT_2025.md` (Web3‑визия)
- смарт‑контрактах в `contracts/`. 
