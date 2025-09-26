"""
Scheduler Automático para Cálculo de Acréscimos
================================================================
Executa automaticamente todos os dias à meia-noite (00:00)
Roda em thread separada para não bloquear o servidor principal
"""

import threading
import schedule
import time
import logging
from datetime import datetime
from job_acrescimos_diario import executar_job_acrescimos

# Configurar logging específico para o scheduler sem emojis
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler_acrescimos.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('scheduler_acrescimos')

class SchedulerAcrescimos:
    def __init__(self):
        self.thread = None
        self.running = False

    def job_wrapper(self):
        """Wrapper para executar o job com tratamento de erro"""
        try:
            logger.info("=" * 60)
            logger.info("EXECUÇÃO AUTOMÁTICA À MEIA-NOITE")
            logger.info(f"Horário: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            logger.info("=" * 60)

            # Executar o job de acréscimos
            executar_job_acrescimos()

            logger.info("Job automático concluído com sucesso")
            logger.info("=" * 60 + "\n")

        except Exception as e:
            logger.error(f"Erro na execução automática: {e}")
            logger.error("=" * 60 + "\n")

    def run_scheduler(self):
        """Função que roda em thread separada"""
        logger.info("Scheduler de acréscimos iniciado")
        logger.info(f"Agendado para executar todos os dias às 00:00")
        logger.info(f"Horário atual: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Agendar para meia-noite todos os dias
        schedule.every().day.at("00:00").do(self.job_wrapper)

        # Também executar uma vez ao iniciar (opcional - remover se não quiser)
        logger.info("Executando job inicial ao iniciar o scheduler...")
        self.job_wrapper()

        while self.running:
            try:
                # Verificar tarefas agendadas
                schedule.run_pending()

                # Aguardar 30 segundos antes de verificar novamente
                # (não precisa verificar a cada segundo, economiza recursos)
                time.sleep(30)

            except Exception as e:
                logger.error(f"Erro no loop do scheduler: {e}")
                time.sleep(60)  # Aguardar 1 minuto em caso de erro

    def start(self):
        """Inicia o scheduler em thread separada"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.run_scheduler, daemon=True)
            self.thread.start()
            logger.info("Thread do scheduler iniciada com sucesso")
            return True
        else:
            logger.warning("Scheduler já está rodando")
            return False

    def stop(self):
        """Para o scheduler"""
        if self.running:
            logger.info("Parando scheduler de acréscimos...")
            self.running = False
            if self.thread:
                self.thread.join(timeout=5)
            logger.info("Scheduler parado")
        else:
            logger.warning("Scheduler não estava rodando")

    def status(self):
        """Retorna o status do scheduler"""
        if self.running and self.thread and self.thread.is_alive():
            next_run = schedule.next_run()
            if next_run:
                tempo_restante = (next_run - datetime.now()).total_seconds()
                horas = int(tempo_restante // 3600)
                minutos = int((tempo_restante % 3600) // 60)

                return {
                    "status": "running",
                    "proximo_job": next_run.strftime('%Y-%m-%d %H:%M:%S'),
                    "tempo_restante": f"{horas}h {minutos}min"
                }
            else:
                return {
                    "status": "running",
                    "proximo_job": "Aguardando agendamento",
                    "tempo_restante": "N/A"
                }
        else:
            return {
                "status": "stopped",
                "proximo_job": None,
                "tempo_restante": None
            }

# Instância global do scheduler
scheduler_instance = None

def iniciar_scheduler():
    """Função para iniciar o scheduler globalmente"""
    global scheduler_instance

    if scheduler_instance is None:
        scheduler_instance = SchedulerAcrescimos()

    return scheduler_instance.start()

def parar_scheduler():
    """Função para parar o scheduler"""
    global scheduler_instance

    if scheduler_instance:
        scheduler_instance.stop()
        scheduler_instance = None

def status_scheduler():
    """Função para obter status do scheduler"""
    global scheduler_instance

    if scheduler_instance:
        return scheduler_instance.status()
    else:
        return {
            "status": "not_initialized",
            "proximo_job": None,
            "tempo_restante": None
        }

if __name__ == "__main__":
    # Teste do scheduler
    print("🧪 Teste do Scheduler de Acréscimos")
    print("=" * 60)

    scheduler = SchedulerAcrescimos()
    scheduler.start()

    try:
        # Manter rodando para teste
        while True:
            status = scheduler.status()
            print(f"\n📊 Status: {status}")
            time.sleep(60)
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrompido pelo usuário")
        scheduler.stop()
        print("✅ Scheduler finalizado")