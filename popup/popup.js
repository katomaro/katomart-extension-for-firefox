document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('katomart_termsAccepted')) {
        document.getElementById('terms-of-use').style.display = 'block';
    } else {
        document.getElementById('main-content').style.display = 'flex';
    }

    document.getElementById('accept-terms').addEventListener('click', function() {
        localStorage.setItem('katomart_termsAccepted', 'true');
        document.getElementById('terms-of-use').style.display = 'none';
        document.getElementById('main-content').style.display = 'flex';
    });



    updateData();
    setInterval(updateData, 10000); // Atualiza dados a cada 10 segundos

    document.getElementById('katomartize-button').addEventListener('click', function() {
        sendData();
    });
});


function updateData() {
    // Obtenha a aba ativa para saber a URL atual
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
        if (tabs.length === 0) return; // Não faz nada se não houver aba ativa
        const url = new URL(tabs[0].url);
        const domain = extractRootDomain(url.hostname);

        // Atualizar os cookies para o domínio principal
        browser.cookies.getAll({domain: domain}).then(cookies => {
            const tableElement = document.getElementById('cookies-table');
            // Limpa a tabela, exceto o cabeçalho
            tableElement.innerHTML = '<tr><th>Nome do Cookie</th><th>Valor do Cookie</th></tr>';
            let tokenExpiry = null;

            cookies.forEach(cookie => {
                const row = tableElement.insertRow(-1); // Insere uma nova linha no final da tabela
                const cellName = row.insertCell(0);
                const cellValue = row.insertCell(1);
                cellName.textContent = cookie.name;
                cellValue.textContent = cookie.value;

                if (cookie.name === 'hmSsoExp') {
                    tokenExpiry = parseInt(cookie.value);
                }
            });
        });

        // Atualizar o token e sua duração
        browser.storage.local.get(['katomart_token', 'katomart_token_expiry']).then(data => {
            if (data.katomart_token) {
                document.getElementById('token-value').textContent = `Token: ${data.katomart_token}`;
                if (tokenExpiry) {
                    const expiryDate = new Date(tokenExpiry * 1000).toLocaleString();
                    document.getElementById('token-duration').textContent = `Expira em: ${expiryDate}`;
                    // Atualizar também no storage local se necessário
                    browser.storage.local.set({katomart_token_expiry: tokenExpiry});
                } else {
                    document.getElementById('token-duration').textContent = 'Duração: Desconhecido';
                }
            }
        });
    });
}

// Função para extrair o domínio principal de um hostname
function extractRootDomain(hostname) {
    let parts = hostname.split('.').reverse(); // Divide o hostname em partes e inverte
    if (parts != null && parts.length > 1) {
        // Concatena o TLD e o domínio de primeiro nível
        return parts[1] + '.' + parts[0]; // Exemplo: para "www.example.com", retorna "example.com"
    }
    return hostname; // Retorna o hostname original se não puder ser dividido corretamente
}


function sendData() {
    const data = {
        // Preencher
    };
    fetch('http://127.0.0.1:6102', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => response.json())
      .then(data => {
          console.log('Success:', data);
      })
      .catch((error) => {
          console.error('Error:', error);
      });
}
