import sys
import os

# Ler o arquivo atual
with open('repositories_adapter.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir caracteres especiais problemáticos
replacements = [
    ('✗', 'ERRO:'),
    ('✓', 'OK:'), 
    ('⚠', 'AVISO:'),
    ('🔄', ''),
    ('✅', 'SUCESSO:'),
    ('❌', 'ERRO:'),
    ('não', 'nao'),
    ('ção', 'cao'),
    ('ões', 'oes'),
    ('âmetros', 'ametros'),
    ('ário', 'ario'),
    ('são', 'sao')
]

for old, new in replacements:
    content = content.replace(old, new)

# Salvar o arquivo corrigido
with open('repositories_adapter.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Arquivo corrigido! Caracteres especiais removidos.")