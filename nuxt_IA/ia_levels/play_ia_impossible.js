import puppeteer from 'puppeteer';
import { $fetch } from 'ofetch';

const API = 'http://localhost:3001/api/dames';
const TARGET_URL = 'http://localhost:3000/jeu?mode=ia&level=impossible'; // Vous pouvez changer le port si besoin

async function run() {
    console.log(`Lancement du navigateur... L'IA va se connecter à ${TARGET_URL}`);
    const browser = await puppeteer.launch({ 
        headless: false, // Afficher le navigateur pour voir l'IA jouer !
        defaultViewport: null,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
        // Suivre le tour via les console.log du jeu
        window.__currentTurn = 'white';
        const originalLog = console.log;
        console.log = function(...args) {
            originalLog.apply(console, args);
            const msg = args.join(' ');
            if (msg.includes("C'est au tour de black")) {
                window.__currentTurn = 'black';
            } else if (msg.includes("C'est au tour de white")) {
                window.__currentTurn = 'white';
            }
        };

        document.addEventListener('click', (e) => {
            // Vrai = Clic humain, Faux = Clic simulé via page.evaluate
            if (!e.isTrusted || !(e.target instanceof Element)) return;

            const indicator = document.querySelector('.player-indicator');
            // Si l'indicateur UI n'est pas là, on utilise notre variables alimentée par les logs
            const isBlackTurn = indicator ? indicator.classList.contains('black') : window.__currentTurn === 'black';

            const isBlackPiece = e.target.closest('.piece.black');
            const isBoardClick = e.target.closest('.row') || e.target.closest('.cell');

            if (isBlackPiece || (isBlackTurn && isBoardClick)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true); // Intercepter lors de la phase de capture
    });

    await page.goto(TARGET_URL);

    let isWaitingForAi = false;

    console.log("🟢 Prêt ! L'IA attend que ce soit le tour des pions Noirs...");

    // Boucle de jeu (vérification du DOM chaque seconde)
    setInterval(async () => {
        if (isWaitingForAi) return;

        try {
            // Vérifier si c'est le tour des noirs
            const isBlackTurn = await page.evaluate(() => {
                const indicator = document.querySelector('.player-indicator');
                if (indicator) return indicator.classList.contains('black');
                return window.__currentTurn === 'black';
            });

            if (!isBlackTurn) return;

            isWaitingForAi = true;
            console.log('\n🤖 ======================================');
            console.log('🤖 Tour de l\'IA (Noirs) détecté ! NIVEAU 4 (Impossible)');
            
            // Vérifier s'il y a des captures obligatoires
            const hasMandatoryCapture = await page.evaluate(() => {
                const mandatoryPieces = document.querySelectorAll('.piece.black.mandatoryCapture');
                return mandatoryPieces.length > 0;
            });

            if (hasMandatoryCapture) {
                console.log(`⚡ Captures obligatoires détectées ! Demande au Minimax de choisir la meilleure...`);
            }

            // Construire la matrice du terrain depuis le DOM du navigateur
            const matrix = await page.evaluate(() => {
                const m = [];
                const rows = document.querySelectorAll('.row');
                rows.forEach(row => {
                    const rowArr = [];
                    const cells = row.querySelectorAll('.cell');
                    cells.forEach(cell => {
                        const piece = cell.querySelector('.piece');
                        if (!piece) {
                            rowArr.push(0);
                        } else if (piece.classList.contains('black')) {
                            rowArr.push(1);
                        } else if (piece.classList.contains('white')) {
                            rowArr.push(2);
                        }
                    });
                    m.push(rowArr);
                });
                return m;
            });

            if (matrix.length !== 10) {
                console.log('Attente du chargement complet du plateau...');
                isWaitingForAi = false;
                return;
            }

            console.log('Réflexion en cours (appel à l\'API)...');
            const resp = await $fetch(API, { 
                method: 'POST', 
                body: { board: matrix, level: 4, player: 1, useMinimaxOnly: hasMandatoryCapture } 
            });

            if (resp.aiMove) {
                // "r1,c1 r2,c2" (Note: le format frontend/backend peut varier, on assure la correspondance)
                const [start, end] = resp.aiMove.split(' ');
                const [r1, c1] = start.split(',').map(Number);
                const [r2, c2] = end.split(',').map(Number);

                console.log(`IA va bouger la pièce de [Y:${r1}, X:${c1}] vers [Y:${r2}, X:${c2}]`);
                
                await page.evaluate(async (r1, c1, r2, c2) => {
                    const rows = document.querySelectorAll('.row');
                    if(rows.length <= Math.max(r1, r2)) return;

                    const row1 = rows[r1];
                    const cell1 = row1.querySelectorAll('.cell')[c1];
                    
                    const piece = cell1.querySelector('.piece');
                    if (piece) piece.click(); // Sélectionne la pièce
                    
                    // Attente légère pour l'animation UI (rafraîchissement Vue)
                    await new Promise(r => setTimeout(r, 600));
                    
                    const row2 = rows[r2];
                    const cell2 = row2.querySelectorAll('.cell')[c2];
                    cell2.click(); // Clique sur la case de destination
                    
                }, r1, c1, r2, c2);
                
                console.log('Mouvement simulé avec succès dans le navigateur !');
                
                // Pause pour laisser l'interface mettre à jour `currentPlayer` (ou gérer les rafles)
                await new Promise(r => setTimeout(r, 1500));
            } else {
                console.log('❌ IA n\'a pas trouvé de mouvement. Pause de 15s pour éviter le spam...');
                await new Promise(r => setTimeout(r, 15000));
            }

        } catch (e) {
            console.log('Erreur boucle principale:', e.message);
            console.log('Pause de 15s suite à une erreur pour éviter de spammer...');
            await new Promise(r => setTimeout(r, 15000));
        } finally {
            isWaitingForAi = false;
        }

    }, 1500); // Check every 1.5s
}

run();
