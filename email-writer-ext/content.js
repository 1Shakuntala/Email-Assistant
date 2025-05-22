console.log("Email Writer Extension - Content Script Loaded");

function createAIButton(){
    
    const button = document.createElement('div');
    button.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight='8px';
    button.innerHTML='AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function findComposeToolbar(){
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for(const selector of selectors ){
        const toolbar = document.querySelector(selector);
        if(toolbar){
            return toolbar;
        }
        return null;
    }
}
function getEmailContent(){
    const selectors = [
        '.h7',
        '.a3s.ail',
        '[role="presentation"]'
    ];
    for(const selector of selectors ){
        const content = document.querySelector(selector);
        if(content){
            return content.innerText.trim();
        }
        return '';
    }
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    const existingToneSelect = document.querySelector('.tone-selector');
    if (existingButton) existingButton.remove();
    if (existingToneSelect) existingToneSelect.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    console.log("Toolbar found, Creating AI-Button and Tone Selector");

    // Tone Selector Dropdown
    const toneSelect = document.createElement('select');
    toneSelect.className = 'tone-selector';
    toneSelect.style.marginRight = '8px';
    toneSelect.style.height = '28px';
    toneSelect.style.borderRadius = '4px';

    ['professional', 'friendly', 'concise', 'empathetic'].forEach(tone => {
        const option = document.createElement('option');
        option.value = tone;
        option.textContent = tone.charAt(0).toUpperCase() + tone.slice(1);
        toneSelect.appendChild(option);
    });

    // AI Reply Button
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;
            const emailContent = getEmailContent();
            const selectedTone = toneSelect.value;

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: selectedTone
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');

            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('ComposeBox was not found');
            }

        } catch (error) {
            console.error(error);
            alert('Failed to Generate Reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    // Inject both
    toolbar.insertBefore(toneSelect, toolbar.firstChild);
    toolbar.insertBefore(button, toolbar.firstChild);
}

observer.observe(document.body, {
    childList:true,
    subtree:true
})