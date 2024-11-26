const OPENAI_API_KEY = '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';
let conversationHistory = [];
let userType = null;
let systemPrompt = '';

function selectUserType(type) {
    userType = type;
    const formLink = formLinks[type];
    
    addMessage(`Please fill out this form before we begin: <a href="${formLink}" target="_blank" style="color: #0066cc;">Click here to open the form</a>`, false);
    addMessage("Once you've completed the form, please type 'ready' and we can start our conversation.", false);
    
    document.getElementById('chatContainer').style.display = 'flex';
    document.querySelector('.user-type-container').style.display = 'none';
    
    systemPrompt = type === 'teen' ? teenPrompt : parentPrompt;
}

function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.innerHTML = isUser ? message : message;
    
    messageDiv.appendChild(messageContent);
    messageContainer.appendChild(messageDiv);
    
    messageContainer.scrollTop = messageContainer.scrollHeight;

    if (message.toLowerCase() === 'ready' && isUser) {
        startChat();
    }

    conversationHistory.push({
        role: isUser ? "user" : "assistant",
        content: message
    });
}

async function getChatResponse(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    ...conversationHistory,
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
}

function startChat() {
    const welcomeMessage = userType === 'teen' 
        ? "Is this a new conversation? I'm here to help you understand and reflect on your menstrual cycle and emotions. Let's start with: how are you today?"
        : "Is this a new conversation? I'm here to help you better understand and support your child through their menstrual journey. How are you feeling about supporting your child today?";
    
    addMessage(welcomeMessage, false);
}

document.getElementById('sendButton').addEventListener('click', async () => {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, true);
        input.value = '';
        
        const response = await getChatResponse(message);
        addMessage(response, false);
    }
});

document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});