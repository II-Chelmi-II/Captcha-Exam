let captchaAttempts = 0;

document.getElementById('number-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const number = parseInt(document.getElementById('number').value, 10);
    document.getElementById('number-form').style.display = 'none'; // Masquer le formulaire
    fetchSequence(number);
});

async function fetchSequence(n) {
    const outputDiv = document.getElementById('output');

    for (let i = 1; i <= n; i++) {
        try {
            const response = await fetch('https://api.prod.jcloudify.com/whoami');

            if (response.status === 403) {
                captchaAttempts++;
                if (captchaAttempts > 3) {
                    outputDiv.innerHTML += `Impossible de résoudre le CAPTCHA après plusieurs tentatives.<br>`;
                    break;
                }
                outputDiv.innerHTML += `CAPTCHA détecté à l'appel ${i}. Résolution en cours...<br>`;
                await resolveCaptcha();
                i--; // Réessayer après la résolution
                continue;
            }

            if (response.ok) {
                outputDiv.innerHTML += `${i}. Forbidden<br>`;
            } else {
                outputDiv.innerHTML += `Erreur à l'appel ${i}.<br>`;
            }
        } catch (error) {
            outputDiv.innerHTML += `Erreur réseau à l'appel ${i}.<br>`;
        }

        // Pause d'une seconde entre les appels
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function resolveCaptcha() {
    return new Promise((resolve) => {
        if (window.AWSWAF) {
            window.AWSWAF.renderCaptcha({
                containerId: 'output',
                callback: (success) => {
                    if (success) {
                        alert('CAPTCHA résolu avec succès. La séquence va continuer.');
                        resolve();
                    } else {
                        alert('Échec de la résolution du CAPTCHA. Veuillez réessayer.');
                    }
                },
            });
        } else {
            console.error('Le script CAPTCHA AWS WAF n’est pas chargé.');
            alert('Impossible de charger le CAPTCHA. Veuillez vérifier la configuration.');
            resolve(); // Continuer pour ne pas bloquer
        }
    });
}