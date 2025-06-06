import os
import sys
import subprocess
import urllib.request
import shutil
import time

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = r"D:\project\SmartLunch"
FRONTEND_DIR = r"D:\project\client"

DOTNET_SDK_LINK = "https://dotnet.microsoft.com/en-us/download/dotnet/8.0"
NODE_INSTALLER_LINK = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"

def prompt_installation(tool_name, download_link, output_file):
    user_input = input(f"{tool_name} не знайдено. Бажаєте завантажити і встановити? (y/n): ").strip().lower()
    if user_input == "y":
        print(f"Завантажуємо {tool_name}...")
        urllib.request.urlretrieve(download_link, output_file)
        print(f"Запускаємо інсталятор {output_file}...")
        subprocess.run(output_file, shell=True)
        print("Після встановлення перезапустіть скрипт.")
        sys.exit(0)
    else:
        print(f"Без {tool_name} подальша робота неможлива.")
        sys.exit(1)

def ensure_dotnet():
    if shutil.which("dotnet") is None:
        print(".NET SDK не виявлено.")
        print(f"Встановіть його вручну з: {DOTNET_SDK_LINK}")
        sys.exit(1)
    else:
        print(".NET SDK успішно знайдено.")

def ensure_node():
    if shutil.which("node") is None:
        prompt_installation("Node.js", NODE_INSTALLER_LINK, "node-setup.msi")
    else:
        print("Node.js встановлено.")

def launch_process(command, workdir=None):
    return subprocess.Popen(command, cwd=workdir, shell=True)

def wait_for_backend_ready(url, timeout=60, delay=2):
    print(f"Очікування відповіді від бекенду за адресою: {url}")
    start = time.time()
    while True:
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    print("Бекенд успішно відповідає!")
                    break
        except:
            pass

        if time.time() - start > timeout:
            print("Таймаут очікування відповіді від сервера.")
            sys.exit(1)

        print("Сервер ще запускається, чекаємо...")
        time.sleep(delay)

def setup_and_run():
    print("Розпочинається підготовка середовища...")

    print("Перевірка середовища:")
    ensure_dotnet()
    ensure_node()

    print("\nЗапускаємо серверну частину...")
    backend = launch_process("dotnet run --project SmartLunch/SmartLunch.csproj", workdir=BACKEND_DIR)

    wait_for_backend_ready("http://localhost:5235/swagger/index.html")

    print("\nВстановлюємо frontend залежності...")
    subprocess.run("npm install --legacy-peer-deps", cwd=FRONTEND_DIR, shell=True)

    print("Запускаємо клієнтську частину...")
    frontend = launch_process("npm start", workdir=FRONTEND_DIR)

    print("\nУспішний запуск!")
    print("Серверна частина: http://localhost:5235/swagger/index.html")
    print("Клієнтська частина: http://localhost:3000")

if __name__ == "__main__":
    setup_and_run()
