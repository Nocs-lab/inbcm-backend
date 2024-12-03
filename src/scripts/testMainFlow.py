from playwright.sync_api import sync_playwright
from time import sleep
from dotenv import load_dotenv
import os

load_dotenv()

site_public = os.getenv("site_public")
page_declaracao = os.getenv("page_declaracao")
user = os.getenv("user")
pwd = os.getenv("pwd")


def login_public(pagina, user, pwd):
    pagina.goto(site_public)
    pagina.fill('xpath=//*[@id="email"]', user)
    pagina.fill('xpath=//*[@id="password"]',pwd)
    pagina.click('xpath=//*[@id="root"]/div[2]/div[1]/form/button')
    sleep(3)
    if pagina.is_visible('text="Minhas declarações"'):
        print("Login realizado com sucesso!")
    else:
        print("Erro no login.")


def test_nova_declaracao(pagina):
    pagina.goto(page_declaracao)
    sleep(3)
    if pagina.is_visible('text=Nova declaração'):
        print("Página de Nova declaração: Acessível")
    else:
        print("Página de Nova declaração: Inacessível")


def test_envio_declaracao(pagina):
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    sleep(1)
    pagina.click('div.br-checkbox label:has-text("Museológico")') 
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    with pagina.expect_file_chooser() as fc:
        pagina.click('xpath=//*[@id="root"]/main/form/div[2]/div/button')
        sleep(2)
        file_chooser = fc.value
        file_chooser.set_files("./28_08_2024_20_29_16_186-02_-_Museologia_Procopio_Resistencia_-_Retificadora.xlsx")
    sleep(2)
    pagina.click('button.br-button.primary.mt-5')
    sleep(1)
    pagina.click('button.br-button.primary.small.m-2')
    sleep(2)
    if pagina.is_visible('text="Declaração enviada com sucesso!"'):
        print("Envio de declaração: Sucesso")
    else:
        print("Envio de declaração: Falhou")
    pagina.click('text= Exibir') 
    sleep(2)


def test_retificacao(pagina):
    pagina.click('text= Retificar') 
    sleep(1)
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    sleep(1)
    pagina.click('div.br-checkbox label:has-text("Museológico")') 
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    sleep(1)
    with pagina.expect_file_chooser() as fc:
        pagina.click('xpath=//*[@id="root"]/main/form/div[2]/div/button')
        sleep(2)
        file_chooser = fc.value
        file_chooser.set_files("./28_08_2024_20_29_16_186-02_-_Museologia_Procopio_Resistencia_-_Retificadora.xlsx")
    sleep(2)
    pagina.click('button.br-button.primary.mt-5') 
    pagina.click("button.br-button.primary.small.m-2") 
    sleep(1)
    if pagina.is_visible('text=Declaração retificadora'):
        print("Declaração retificada: Sucesso")
    else:
        print("Declaração retificada: Falhou")
    sleep(1)


def test_exclusao_declaracao(pagina):
    pagina.click('text= Excluir') 
    sleep(1)
    pagina.click('text=Confirmar')
    sleep(2)
    if pagina.is_visible('text=Declaração excluída com sucesso!'):
        print("Exclusão de declaração: Sucesso\n")
        print("""# Fluxo principal de:\n
- Envio de declaração
- Retificação
- Exclusão
    OK""")
    else:
        print("Exclusão de declaração: Falhou")


with sync_playwright() as p:
    navegador = p.chromium.launch(headless=False)
    pagina = navegador.new_page()
    login_public(pagina, user, pwd)
    test_nova_declaracao(pagina)
    test_envio_declaracao(pagina)
    test_retificacao(pagina)
    test_exclusao_declaracao(pagina)