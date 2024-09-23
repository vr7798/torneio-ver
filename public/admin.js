// public/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const generateReportButton = document.getElementById('generate-report');
    const downloadPdfButton = document.getElementById('download-pdf');
    const reportContainer = document.getElementById('report-container');
    const reportTableBody = document.querySelector('#report-table tbody');

    generateReportButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/admin/report', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const teams = await response.json();
                populateReportTable(teams);
                reportContainer.classList.remove('hidden');
            } else {
                const error = await response.json();
                alert('Erro ao gerar relatório: ' + error.error);
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao gerar relatório.');
        }
    });

    downloadPdfButton.addEventListener('click', () => {
        window.location.href = '/admin/report/pdf';
    });

    function populateReportTable(teams) {
        // Limpar tabela existente
        reportTableBody.innerHTML = '';

        teams.forEach(team => {
            const tr = document.createElement('tr');

            // Data e Hora de Cadastro
            const dataTd = document.createElement('td');
            const data = new Date(team.dataCadastro);
            dataTd.textContent = data.toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
            });
            tr.appendChild(dataTd);

            // Nome do Time
            const nomeTd = document.createElement('td');
            nomeTd.textContent = team.nome;
            tr.appendChild(nomeTd);

            // Nome do Animal
            const animalTd = document.createElement('td');
            animalTd.textContent = team.animalName;
            tr.appendChild(animalTd);

            // Membros
            const membrosTd = document.createElement('td');
            const membrosList = document.createElement('ul');
            membrosList.style.listStyleType = 'none';
            membrosList.style.paddingLeft = '0';

            team.membros.forEach(membro => {
                const membroLi = document.createElement('li');
                membroLi.textContent = membro.nome + (membro.telefone ? ` (Telefone: ${membro.telefone})` : '');
                membrosList.appendChild(membroLi);
            });

            membrosTd.appendChild(membrosList);
            tr.appendChild(membrosTd);

            reportTableBody.appendChild(tr);
        });
    }
});
