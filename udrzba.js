document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('dev_bypass') !== 'true') {
        const overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.innerHTML = `
            <div style="position:fixed; inset:0; width:100vw; height:100vh; background:#f3efe6; z-index:2147483647; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:Montserrat, sans-serif; color:#33322e; text-align:center;">
                <h1 id="dev-unlock" style="font-size:2.5rem; margin-bottom:10px; user-select:none;">Omlouváme se za strpení</h1>
                <p style="font-size:1.2rem;">Na stránce se aktivně pracuje.</p>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        function unlock() {
            const ov = document.getElementById('maintenance-overlay');
            if (ov) ov.remove();
            document.body.style.overflow = 'auto';
            sessionStorage.setItem('dev_bypass', 'true');
        }

        let secretKeys = '';
        document.addEventListener('keydown', (e) => {
            secretKeys += e.key.toLowerCase();
            if (secretKeys.includes('dev123')) {
                unlock();
            }
            if (secretKeys.length > 20) secretKeys = secretKeys.slice(-10);
        });

        let clicks = 0;
        document.getElementById('dev-unlock').addEventListener('click', () => {
            clicks++;
            if (clicks >= 5) unlock();
        });
    }
});
