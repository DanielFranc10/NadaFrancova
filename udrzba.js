if (sessionStorage.getItem('dev_bypass') !== 'true') {
    const overlay = document.createElement('div');
    overlay.id = 'maintenance-overlay';
    overlay.innerHTML = `
        <div style="position:fixed; inset:0; width:100vw; height:100vh; background:#f3efe6; z-index:2147483647; display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:Montserrat, sans-serif; color:#33322e; text-align:center;">
            <h1 style="font-size:2.5rem; margin-bottom:10px;">Omlouváme se za strpení</h1>
            <p style="font-size:1.2rem;">Na stránce se aktivně pracuje.</p>
        </div>
    `;
    document.documentElement.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    let secretKeys = '';
    document.addEventListener('keydown', (e) => {
        secretKeys += e.key;
        if (secretKeys.includes('dev123')) {
            document.getElementById('maintenance-overlay').remove();
            document.body.style.overflow = 'auto';
            sessionStorage.setItem('dev_bypass', 'true');
        }
        if (secretKeys.length > 20) secretKeys = secretKeys.slice(-10);
    });
}
