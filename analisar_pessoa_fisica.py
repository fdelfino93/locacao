#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Análise do arquivo pessoa_fisica.xlsx
====================================

Analisa a estrutura e dados do arquivo Excel para preparar migração.
"""

import pandas as pd
from datetime import datetime

def log(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def analisar_arquivo():
    """Analisa o arquivo pessoa_fisica.xlsx"""
    log("=== ANALISANDO ARQUIVO PESSOA_FISICA.XLSX ===")
    
    try:
        # Carregar Excel
        df = pd.read_excel("pessoa_fisica.xlsx")
        
        log(f"Total de registros: {len(df)}")
        log(f"Colunas encontradas ({len(df.columns)}):")
        
        for i, col in enumerate(df.columns):
            log(f"  {i+1:2d}. {col}")
        
        print("\n" + "="*60)
        log("PRIMEIRAS 3 LINHAS DO ARQUIVO:")
        print("="*60)
        
        # Mostrar primeiras linhas
        for idx, row in df.head(3).iterrows():
            log(f"\n--- PESSOA {idx + 1} ---")
            for col in df.columns:
                valor = row[col]
                if pd.isna(valor):
                    valor = "[VAZIO]"
                log(f"  {col}: {valor}")
        
        print("\n" + "="*60)
        log("ANALISE DOS CAMPOS:")
        print("="*60)
        
        # Analisar cada campo
        for col in df.columns:
            valores_nao_vazios = df[col].dropna().nunique()
            valores_unicos = df[col].nunique()
            log(f"{col}:")
            log(f"  - Valores únicos: {valores_unicos}")
            log(f"  - Não vazios: {valores_nao_vazios}")
            
            # Mostrar alguns exemplos
            exemplos = df[col].dropna().unique()[:3]
            if len(exemplos) > 0:
                log(f"  - Exemplos: {list(exemplos)}")
            log("")
        
        return df
        
    except Exception as e:
        log(f"ERRO ao carregar arquivo: {e}")
        return None

if __name__ == "__main__":
    analisar_arquivo()