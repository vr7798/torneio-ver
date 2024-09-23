// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const teamForm = document.getElementById('team-form');
    const membersContainer = document.getElementById('members-container');

    const MAX_MEMBERS = 5;

    // Função para criar campos de membro
    function createMemberFields(index) {
        const memberDiv = document.createElement('div');
        memberDiv.classList.add('form-group');

        const memberLabel = document.createElement('label');
        memberLabel.textContent = `Membro ${index}:`;
        memberDiv.appendChild(memberLabel);

        const memberName = document.createElement('input');
        memberName.type = 'text';
        memberName.name = `membro_nome_${index}`;
        memberName.placeholder = 'Nome do membro';
        memberName.required = true;
        memberDiv.appendChild(memberName);

        const memberPhone = document.createElement('input');
        memberPhone.type = 'text';
        memberPhone.name = `membro_telefone_${index}`;
        memberPhone.placeholder = 'Telefone do membro (opcional)';
        memberDiv.appendChild(memberPhone);

        membersContainer.appendChild(memberDiv);
    }

    // Inicialmente criar 5 campos de membros
    for (let i = 1; i <= MAX_MEMBERS; i++) {
        createMemberFields(i);
    }

    // Função para coletar dados do formulário
    function collectFormData() {
        const membros = [];

        for (let i = 1; i <= MAX_MEMBERS; i++) {
            const nomeMembro = document.querySelector(`input[name="membro_nome_${i}"]`).value.trim();
            const telefoneMembro = document.querySelector(`input[name="membro_telefone_${i}"]`).value.trim();

            if (nomeMembro === '') {
                alert(`Por favor, preencha o nome do membro ${i}.`);
                return null;
            }

            membros.push({
                nome: nomeMembro,
                telefone: telefoneMembro || null
            });
        }

        return { membros };
    }

    // Função para gerar a URL do WhatsApp com mensagem pré-preenchida
    function gerarLinkWhatsApp(animalName, membros) {
        const numeroDestino = '+559591591143'; // Formato internacional: +55 95 9959159143

        // Montar a mensagem
        let mensagem = `Olá! Sou do time ${animalName}.\n\n`;
        mensagem += 'Aqui estão os membros da equipe:\n';
        membros.forEach((membro, index) => {
            mensagem += `${index + 1}. ${membro.nome}\n`;
        });

        // Codificar a mensagem para URL
        const mensagemCodificada = encodeURIComponent(mensagem);

        // Retornar a URL completa
        return `https://wa.me/${numeroDestino}?text=${mensagemCodificada}`;
    }

    // Função para exibir mensagem de confirmação com o nome do animal e link do WhatsApp
    function showConfirmation(animalName, membros) {
        // Criar a div de confirmação
        const confirmationDiv = document.createElement('div');
        confirmationDiv.id = 'confirmation-message';
        confirmationDiv.classList.add('confirmation-message');

        // Adicionar ícone de confirmação
        const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-check-circle');
        confirmationDiv.appendChild(icon);

        // Adicionar texto de confirmação
        const message = document.createElement('p');
        message.innerHTML = `Time em análise. Aguarde a confirmação que em breve você receberá no seu WhatsApp.<br><strong>Nome do Time:</strong> ${animalName}`;
        confirmationDiv.appendChild(message);

        // Adicionar link do WhatsApp
        const whatsappLink = document.createElement('a');
        whatsappLink.href = gerarLinkWhatsApp(animalName, membros);
        whatsappLink.target = '_blank';
        whatsappLink.classList.add('whatsapp-link');
        whatsappLink.innerHTML = 'Enviar Detalhes via WhatsApp';

        confirmationDiv.appendChild(whatsappLink);

        // Adicionar a div de confirmação ao container
        const container = document.querySelector('.container');
        container.appendChild(confirmationDiv);

        // Opcional: Scroll para a mensagem de confirmação
        confirmationDiv.scrollIntoView({ behavior: 'smooth' });
    }

    // Função para cadastrar a equipe
    teamForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = collectFormData();
        if (!data) return;

        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const equipe = await response.json();
                showConfirmation(equipe.animalName, equipe.membros);
                teamForm.reset();
                // Ocultar o formulário
                teamForm.style.display = 'none';
            } else {
                const error = await response.json();
                alert('Erro ao cadastrar equipe: ' + error.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao cadastrar equipe.');
        }
    });
});
