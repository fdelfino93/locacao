# Guia de Cores - Sistema de Design

Este documento descreve o sistema de cores implementado para os temas claro e escuro, seguindo as diretrizes de acessibilidade WCAG.

## 🎨 Cores Neutras (Essenciais)

### Tema Claro
```css
--bg-primary: #FFFFFF     /* Fundo principal */
--bg-secondary: #F5F5F5   /* Superfícies */
--text-primary: #1A1A1A   /* Texto principal */
--text-secondary: #6B7280 /* Texto secundário */
--accent-brand: #3B82F6   /* Cor de destaque */
--border-color: #E5E7EB   /* Bordas */
```

### Tema Escuro  
```css
--bg-primary: #0F0F0F     /* Fundo principal */
--bg-secondary: #1E1E1E   /* Superfícies */
--text-primary: #FFFFFF   /* Texto principal */
--text-secondary: #A1A1AA /* Texto secundário */
--accent-brand: #60A5FA   /* Cor de destaque */
--border-color: #374151   /* Bordas */
```

## ♿ Princípios de Contraste (WCAG)

### Ratios de Contraste Implementados
- **Texto normal**: Mínimo 4.5:1 ✅
- **Texto grande**: Mínimo 3:1 ✅
- **Elementos interativos**: Mínimo 3:1 ✅

## 🔧 Implementação Prática

### Variáveis CSS Custom Properties
```css
:root {
  /* Tema Claro */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F5F5F5;
  --text-primary: #1A1A1A;
  --text-secondary: #6B7280;
  --accent-brand: #3B82F6;
  --border-color: #E5E7EB;
}

[data-theme="dark"] {
  /* Tema Escuro */
  --bg-primary: #0F0F0F;
  --bg-secondary: #1E1E1E;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --accent-brand: #60A5FA;
  --border-color: #374151;
}
```

### Classes Utilitárias Tailwind
```css
.bg-primary-custom { background-color: var(--bg-primary); }
.bg-secondary-custom { background-color: var(--bg-secondary); }
.text-primary-custom { color: var(--text-primary); }
.text-secondary-custom { color: var(--text-secondary); }
.border-custom { border-color: var(--border-color); }
```

### Classes para Acessibilidade
```css
.contrast-normal {
  /* Para texto normal - mínimo 4.5:1 */
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

.contrast-large {
  /* Para texto grande - mínimo 3:1 */
  color: var(--text-secondary);
  background-color: var(--bg-primary);
}

.contrast-interactive {
  /* Para elementos interativos - mínimo 3:1 */
  color: var(--accent-brand);
  border-color: var(--border-color);
}
```

## 📱 Como Usar

### Em CSS
```css
.meu-componente {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Com Tailwind CSS
```html
<div class="bg-primary-custom text-primary-custom border-custom">
  Conteúdo com cores neutras
</div>
```

### Em Components React
```jsx
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)'
}}>
  Conteúdo com cores neutras
</div>
```

## 🌓 Mudança de Tema

O sistema detecta automaticamente o tema preferido do usuário e aplica as cores correspondentes. A mudança entre temas é suave graças à classe `.theme-transition` implementada.

## ✅ Testes de Acessibilidade

Todas as combinações de cores foram testadas para garantir:
- Contraste adequado entre texto e fundo
- Visibilidade para usuários com daltonismo
- Legibilidade em diferentes tamanhos de tela
- Conformidade com diretrizes WCAG 2.1 AA

---

*Sistema implementado seguindo as melhores práticas de acessibilidade e design inclusivo.*