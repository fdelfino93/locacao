# Corrigir caracteres especiais de forma mais simples
import re

# Ler arquivo
with open('repositories_adapter.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir apenas os caracteres problemáticos nas mensagens de print
content = re.sub(r'print\(f"[✓✗❌✅⚠🔄💥🆕🏠📍📋🚀]*\s*([^"]*)"', r'print(f"\1"', content)

# Salvar
with open('repositories_adapter.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Caracteres especiais removidos dos prints!")