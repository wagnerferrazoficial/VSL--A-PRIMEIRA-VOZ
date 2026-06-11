# Diretrizes de Desenvolvimento Mobile-First

Todas as futuras implementações, telas, componentes e interações neste projeto devem ser desenhados e otimizados **primeiramente para dispositivos móveis (Mobile-First)**.

## Regras de Design e UX Mobile

1. **Abordagem Mobile-First Estrita**:
   - Desenvolva os componentes pensando primeiro nas telas pequenas de smartphones (~320px a 430px de largura).
   - Use grids de uma única coluna por padrão ou layouts flexíveis verticais.
   - Utilize classes responsivas do Tailwind (`md:`, `lg:`) apenas para adaptar o conteúdo caso seja visualizado em telas maiores (ex: centralizando a aplicação ou adaptando grids).

2. **Elementos de Interação (Toque)**:
   - Todos os botões, links e elementos clicáveis devem ter uma área de toque mínima de **44px x 44px** para evitar cliques acidentais e melhorar a acessibilidade física.
   - Adicione margens generosas entre elementos interativos.
   - Garanta feedbacks visuais imediatos ao toque/clique (`active:scale-95`, `transition-all`).

3. **Tipografia e Cores**:
   - Tamanhos de texto legíveis sem necessidade de zoom (mínimo de `text-sm` ou `text-base` para textos de leitura).
   - Use contrastes altos e cores limpas para boa legibilidade sob diferentes níveis de iluminação externa (comum no uso de celulares).

4. **Navegação e Estrutura**:
   - Prefira menus estilo Bottom Navigation (barra inferior fixada) ou gavetas/modais inferiores (*Bottom Sheets*) que fiquem ao alcance do polegar.
   - Evite barras laterais complexas ou hover states como única forma de acessar recursos críticos, pois hovers não existem em telas de toque.
