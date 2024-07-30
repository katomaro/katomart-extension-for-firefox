let platforms = {
    hotmart: {
        authentication_url: "*://api-sec-vlc.hotmart.com/security/oauth/check_token*", // termina com ?token=...
        cookie_authentication: "hmVlcIntegration",
        cookie_authentication_expiry: "hmSsoExp" // Primeiro item separado por | , em Epoch, geralmente com duração de 2 dias e algumas horas.
    }
};

function getPlatformFromURL(url) {
    const hostname = new URL(url).hostname;
    return Object.keys(platforms).find(key => 
        hostname.includes(key) // Supondo que a chave do objeto é parte do hostname
    );
}

// Listener para responder às mensagens dos scripts de popup ou conteúdo
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getPlatformInfo") {
        // Retorna as informações da plataforma. Aqui, retorna-se todas, mas poderia filtrar baseado em mais dados de `message` se necessário
        sendResponse({platforms: platforms});
    }
    return true;  // Indica que a resposta pode ser assíncrona
});

browser.webRequest.onBeforeRequest.addListener(
    function(details) {
        const url = new URL(details.url);
        const platformKey = getPlatformFromURL(details.url);

        if (!platformKey) return;

        const platform = platforms[platformKey];
        let token = url.searchParams.get('token');
        if (token) {
            browser.storage.local.set({katomart_token: token});
        } else {
            console.log("Token não encontrado na URL:", url.href);
        }
    },
    {urls: Object.values(platforms).map(p => p.authentication_url)}, // Usa todas as URLs
);
