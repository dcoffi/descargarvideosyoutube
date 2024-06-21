
document.getElementById('download-btn').addEventListener('click', async () => {
    const mispinner=document.getElementById('mi-spinner');
    const filaVideo=document.getElementById('filaVideo');
    const url = document.getElementById('url').value;
    if (!url) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor ingresa una URL de YouTube',
        });
        return;
    }
    mispinner.classList.remove('d-none');
    filaVideo.classList.add('p-3');
    try {
        const videoPath = await window.electronAPI.downloadVideo(url);
        const videoElement = document.getElementById('video');
        videoElement.src = `file://${videoPath}`;
        videoElement.load();
        //videoElement.play();
        mispinner.classList.add('d-none');
        filaVideo.classList.remove('p-3');
    } catch (error) {
        mispinner.classList.add('d-none');
        filaVideo.classList.remove('p-3');
        //console.error('Error downloading video:', error);
         Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error descargando el video: Por favor verifique el URL`,
        });
        
    }
});

document.getElementById('select-dir-btn').addEventListener('click', async () => {
    const selectedDir = await window.electronAPI.selectDirectory();
   
    const seleccionDirectorio=document.getElementById('selected-dir');
    document.getElementById('selected-dir').innerText = `Directorio seleccionado: ${selectedDir || 'Ninguno'}`;
    let valor=document.getElementById('selected-dir').innerText;
     if(valor.includes('Ninguno')){
        console.log(`No se selecciono nada`);
        seleccionDirectorio.classList.remove('alert-success');
        seleccionDirectorio.classList.add('alert-danger');
     }else{
         seleccionDirectorio.classList.remove('alert-danger');
         seleccionDirectorio.classList.add('alert-success');
     }
    
});
document.getElementById('download-audio-btn').addEventListener('click', async () => {
    const mispinner=document.getElementById('mi-spinner');
    const url = document.getElementById('url').value;
    mispinner.classList.remove('d-none');
    filaVideo.classList.add('p-3');
    try {
        const audioPath = await window.electronAPI.downloadAudio(url);
        mispinner.classList.add('d-none');
        filaVideo.classList.remove('p-3');
        Swal.fire({
            icon: 'success',
            title: 'Descarga completada',
            text: `Audio descargado en: ${audioPath}`,
        });
        
    } catch (error) {
        mispinner.classList.add('d-none');
        filaVideo.classList.remove('p-3');
        //console.error('Error downloading audio:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error descargando el audio: por favor verifique el URL`,
        });
    }
});