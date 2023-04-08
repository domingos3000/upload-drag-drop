const uploadZone = document.querySelector('#upload-zone')
const input = document.getElementById('input-file-upload')
const globalListHTML = document.querySelector('.files-loaded');
const btnRemoveFile = document.getElementById('button-remove-file')
const btnSubmit = document.getElementById('btn-submit')
const boxUpload = document.querySelector('.box-upload')



// VARIAVEIS GLOBAIS DE AUXILIO (HACKING)

let storeFiles = [];
let reader;
let stopProgress = [];


// FUNÇÕES


// Mostrar Erros na tela, caso haja!
const handleError = (msg = 'Falha!') => {

	const div1 = document.createElement('div')
	const div2 = document.createElement('div')
	const div3 = document.createElement('div')
	
	div1.classList.add('tools_error', 'animate__animated', 'animate__zoomIn', 'animate__fast')
	div2.classList.add('icon')
	
	div3.classList.add('text')
	div3.innerText = msg

	div1.appendChild(div2)
	div1.appendChild(div3)

	boxUpload.insertBefore(div1, input)

	setTimeout(() => {
		document.querySelector('.tools_error').className = 'tools_error animate__animated animate__zoomOut'
	}, 3000)

	setTimeout(() => {
		document.querySelector('.tools_error').remove()
	}, 4000)
}

// Renderizar o arquivo e os seus dados na tela
function handlerFile(filename, size, status, index, typeIcon){

	const elementHTML = `

				<div class="file ${typeIcon}" data-index=${index}>
					
					<div class="icon-file"><div class="icon"></div></div>
					
					<div class="description-file">
						<div class="box">
							<div class="file-name-size">
								<div class="name" title="${filename}">${filename}</div>
								<div class="size">${size}</div>
							</div>
							
							<div class="icon" id="button-remove-file" data-id=${index} onClick="removeFileInStorage(event)"></div>
						</div>
						
						<div class="file-progress">
							<div class="progress" >
								<div class="load" style="width: 0%;"></div>
							</div>
							<div class="status">${status}</div>
						</div>
					</div>
				</div>`

		globalListHTML.innerHTML += elementHTML
}

// Actualizar a percentagem ou o estado do ficheiro
function updateElementHtml(elementHTML, percent){

	elementHTML.querySelector('.status').innerText = percent + '%'
	elementHTML.querySelector('.progress .load').style.width = percent + '%'
}

// Remover um ficheiro que foi concluido com sucesso
function removeFileInStorage({target}){


	const idFile = target.getAttribute('data-id')
	const fileStatus = document.querySelector(`[data-index="${idFile}"] .status`)
	const num = fileStatus.innerText.replace('%','')
	

	if(num < 100){
		stopProgress = [true, idFile];
	}


	const updateStorage = storeFiles.filter(file => {


		if(file.id == idFile){
			
			const fileFound = document.querySelector(`[data-index="${idFile}"]`)

			fileFound.classList.add('animate__animated', 'animate__bounceOut')
			
			setTimeout(() => {
				fileFound.remove()

			}, 1000)
			
			return;

		} 
		return file;
	})

	storeFiles = updateStorage
	start()
}

// Resetar os meus botoes logo na primeira renderização
function start(){

	if(storeFiles.length == 0){
		btnSubmit.classList.add('animate__animated', 'animate__shakeX', 'animate__fast')
		btnSubmit.setAttribute('disabled', true)
	} else {
		btnSubmit.className = ''
		btnSubmit.removeAttribute('disabled')

	}
}

// Filtrar os arquivos que serão usados e eliminar os que foram ignorados
function filterFiles(filesArray){

	const files = filesArray;

	const listFileFilter = files.filter((file) => {
		
		if(storeFiles.length > 0) {
			for(i in storeFiles){
			
				if(storeFiles[i].file.name == file.name){
					handleError('O arquivo adicionado recentemente ja existe!')
				} else {
					return file;
				}
			}
		} else {
			return file
		}
		

	})

	const filesFiltered = [...listFileFilter]

	readerFileAndStorage(filesFiltered);
}

// Fazer a leitura dos arquivos e guardar
function readerFileAndStorage(files){


	files.forEach((file) => {
		const index = Math.random(0, 50).toFixed(5);
		reader = new FileReader();

		reader.readAsDataURL(file)

		reader.addEventListener('loadend', (e) => {

			if(e.loaded == e.total){

				storeFiles = [...storeFiles, {file, id: index}]
				start()
			} else {

				handleError('Arquivo demasiado grande, tente outro!')
			}

		})

		reader.addEventListener('loadstart', (e) => {
			let size;
			let typeIcon;
			let type = file.name.split('.').pop();

			if(/(jpg|png|jpeg|jfif|gif|svg)/i.test(type)){
				typeIcon = 'image'
			} else if (/(docx|pdf|xlsx|pptx)/i.test(type)) {

				switch(type){
					case 'docx':
					 typeIcon = 'word'
					 break
					case 'pdf':
					 typeIcon = 'pdf'
					 break
					case 'xlsx':
					 typeIcon = 'excel'
					 break
					case 'pptx':
					 typeIcon = 'powerpoint'
					 break
					default:
					 typeIcon = 'doc-any'
				}
			} else if(/(mp3|mp4|mkv)/i.test(type)) {
					
					switch(type){
						case 'mp3':
						 typeIcon = 'music'
						 break
						case 'mp4':
						 typeIcon = 'video'
						 break
						case 'mkv':
						 typeIcon = 'video'
						 break
						default:
						 typeIcon = 'doc-any'
				}
			}


			if(file.size < 1024){
				const calc = (file.size).toFixed(1)
				size = calc + ' B'
			}
			else if(file.size < (1024*1024)){
				const calc = (file.size/1024).toFixed(1)
				size = calc + ' KB'
			}
			else if(file.size < (1024*1024*1024)){
				const calc = (file.size/(1024*1024)).toFixed(1)
				size = calc + ' MB'
			} else {
				const calc = (file.size/(1024*1024*1024)).toFixed(1)
				size = calc + ' GB'
			}

			handlerFile(file.name, size, 0, index, typeIcon)
		})

		function updateFilesWriting(e){

			const percent = Math.floor((100 * e.loaded) / e.total)

			updateElementHtml(document.querySelector(`[data-index="${index}"]`), percent)

			if(stopProgress[0]){
				reader.removeEventListener('progress', updateFilesWriting, true)

				const fileFound = document.querySelector(`[data-index="${stopProgress[1]}"]`)

				fileFound.classList.add('animate__animated', 'animate__bounceOut')

				setTimeout(() => {
					fileFound.remove()
				}, 1000)
				
				return stopProgress = [];
			}
		}

		reader.addEventListener('progress',  updateFilesWriting, true)

	})		
}


// EVENTOS


uploadZone.ondragover = (e) => {
	e.preventDefault()
	e.stopPropagation()
}

uploadZone.ondragenter = (e) => {
	e.preventDefault()
	e.stopPropagation()

	e.target.classList.add('dragenter')
	e.target.querySelector('.label .text').innerHTML = "<p>Solte aqui os arquivos</p>"
}

uploadZone.ondragleave = (e) => {

	e.target.classList.remove('dragenter')
	e.target.querySelector('.label .text').innerHTML = `<h3>Importe seus arquivos</h3><p>Arraste ou clique para fazer upload</p>`
}

uploadZone.ondrop = (e) => {

	e.preventDefault()
	e.stopPropagation()
	e.target.classList.remove('dragenter')
	e.target.querySelector('.label .text').innerHTML = `<h3>Importe seus arquivos</h3><p>Arraste ou clique para fazer upload</p>`


	const files = [...e.dataTransfer.files];
	filterFiles(files)
}


input.onchange = (e) => {

	const files = [...e.target.files];

	filterFiles(files)
}

btnSubmit.onclick = start