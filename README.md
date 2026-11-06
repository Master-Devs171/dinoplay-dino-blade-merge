# Dino Blade Merge

Jogo de fusão e lançamento de lâminas contra troncos rotativos. Inspirado no ciclo de jogo de Knife Merge, com implementação e gráficos Canvas próprios. Sem recursos, código ou marcas de terceiros. Não é uma reprodução 100% do original.

Arrasta duas lâminas iguais para as fundir ou toca numa e depois noutra igual. Segura Lançar ou Espaço para disparar uma faca de cada vez. O inventário cresce até 50 facas. Lâminas de nível 3 ou superior perfuram as que estão presas e as mais avançadas podem voltar ou fazer ricochete antes do próximo disparo. As fases avançadas aceleram a rotação do alvo e variam o ritmo. O alvo ancestral surge a cada cinco fases. Compras usam apenas moedas ganhas no jogo.

Funciona com rato, teclado e toque. Opções de som, pausa automática e progresso local. Sem anúncios, contas, pagamentos ou rede em tempo de jogo.

`npm test` verifica fusões, economia, colisões, perfuração, projéteis e progressão. `npm run dev` abre http://127.0.0.1:8792/.

## Poderes e coleção

Depois de cada vitória escolhe uma melhoria permanente de dano, cadência ou prémios (até 10 níveis). A escolha fica pendente se fechares a página, sem duplicar o prémio. A coleção apresenta as oito lâminas e o que falta descobrir. Na fase 3 desbloqueia-se Gelo: uma utilização por fase que para a rotação durante três segundos. Alvos ancestrais têm dois setores de armadura e um ponto fraco assinalados.

## Publicação e app

[Jogar agora](https://dino-blade-merge-master171.master-171.chatgpt.site/) · [Código no GitHub](https://github.com/Master-Devs171/dinoplay-dino-blade-merge)

![Dino Blade Merge](cover.jpg)

Pacote DinoPlay: manifest.json aponta para dist/index.html. Inclui o SDK local, guarda progresso através da app quando integrado e permite voltar à biblioteca. Fora da app funciona sem login e guarda o progresso neste dispositivo. Idioma atual: português. Todos os recursos de execução são locais; sem anúncios, pagamentos ou serviços externos.

Validação: node scripts/validate.mjs. Desenvolvimento: npm run dev. Testes: npm test.
