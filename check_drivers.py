#!/usr/bin/env python3
"""
Script para verificar drivers ODBC disponíveis
"""

import pyodbc

def check_odbc_drivers():
    print("DRIVERS ODBC DISPONIVEIS:")
    print("=" * 40)

    drivers = pyodbc.drivers()

    if not drivers:
        print("NENHUM driver ODBC encontrado!")
        return False

    print(f"Total de drivers encontrados: {len(drivers)}")
    print()

    sql_server_drivers = []

    for i, driver in enumerate(drivers, 1):
        print(f"{i}. {driver}")
        if "SQL Server" in driver:
            sql_server_drivers.append(driver)

    print("\nDRIVERS SQL SERVER ENCONTRADOS:")
    print("-" * 40)

    if sql_server_drivers:
        for driver in sql_server_drivers:
            print(f"- {driver}")

        # Sugerir configuração
        print(f"\nSUGESTAO PARA .env:")
        print(f"DB_DRIVER={sql_server_drivers[0]}")
        return True
    else:
        print("NENHUM driver SQL Server encontrado!")
        print("\nINSTALE UM DRIVER SQL SERVER:")
        print("1. Baixe de: https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server")
        print("2. Instale o 'ODBC Driver 17 for SQL Server' ou 'ODBC Driver 18 for SQL Server'")
        return False

if __name__ == "__main__":
    check_odbc_drivers()