Fase 1 – Alicerce (MVP básico)
- [x] Configurar projeto Expo com TypeScript
- [x] Navegação e layout base (Expo Router, ThemeProvider, SafeArea)
- [x] Calculadora CDB/RDB (tela, cálculo, lógica reversa)
- [x] Calculadora LCI/LCA (tela, cálculo, lógica reversa)
- [x] Calculadora Tesouro Direto (tela, cálculo, ajuste final) — ver issue separada
- [ ] Compartilhamento (todas calculadoras)

Fase 2 – MVP Pro/Monetização
- [ ] Paywall e onboarding Pro (RevenueCat ou similar)
			- Configurar produtos: Assinatura anual / compra única
			- Implementar verificação isPro
			- Tela de Paywall (benefícios + CTA)
			- Estado de carregamento / fallback offline
			- Lógica de restauração de compra
- [ ] Gráfico evolução (linha, tabelas)
			- Gráficos só acessíveis se isPro
			- Comparador só acessível se isPro
			- Mostrar versão “blur” antes de bloquear (upsell)
			- Escolher lib (victory-native ou outra)
			- Gerar série temporal: mês a mês (considerar aportes)
			- Alternar modo: Gráfico | Detalhes
			- Tooltip ao tocar em pontos
			- Reuso para Tesouro IPCA+
- [ ] Possibilidade de salvar simulações (localStorage)
- [ ] Comparador básico entre investimentos
			- Tela com dois blocos de inputs e resultado
			- Cálculo simultâneo
			- Destacar vencedor (ex: badge “+R$ X”)
			- Botão “Copiar parâmetros para simulação”
- [ ] Remoção de anúncios para Pro (se houver banner)
			- Guardas condicionais no componente de Banner

Fase 3 – Retenção / Valor Agregado
- [ ] Vitrine de oportunidades (JSON/manual, futura API)
- [ ] Alertas inteligência (push simples)
- [ ] Notificações – reengajamento / lembretes

Fase 4 – Engajamento / Ecossistema
- [ ] Carteira de simulações (CRUD, salvar/reabrir)
- [ ] Metas financeiras (progresso)
- [ ] Gamificação simples (XP, badges)
- [ ] Educação integrada/trilha

Monetização – Estratégia
- [ ] Sem anúncios no MVP inicial (feedback)
- [ ] Banner discreto se precisar, só nas telas grátis (testar métricas)
- [ ] Oportunidade patrocinada futura na Vitrine
- [ ] Paywall sempre clara e sem pegadinhas

Observabilidade
- [ ] Instrumentar eventos principais de simulação, acesso Pro, upgrade, compartilhamento
- [ ] Preparar funil Free → Pro e analisar nas primeiras semanas
