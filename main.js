function makeid(length) {
	var result = [];
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result.push(characters.charAt(Math.floor(Math.random() *
			charactersLength)));
	}
	return result.join('');
}

function getCrop(image, size, clipPosition = 'center-middle') {
	const width = size.width;
	const height = size.height;
	const aspectRatio = width / height;

	let newWidth;
	let newHeight;

	const imageRatio = image.width / image.height;

	if (aspectRatio >= imageRatio) {
		newWidth = image.width;
		newHeight = image.width / aspectRatio;
	} else {
		newWidth = image.height * aspectRatio;
		newHeight = image.height;
	}

	let x = 0;
	let y = 0;
	if (clipPosition === 'left-top') {
		x = 0;
		y = 0;
	} else if (clipPosition === 'left-middle') {
		x = 0;
		y = (image.height - newHeight) / 2;
	} else if (clipPosition === 'left-bottom') {
		x = 0;
		y = image.height - newHeight;
	} else if (clipPosition === 'center-top') {
		x = (image.width - newWidth) / 2;
		y = 0;
	} else if (clipPosition === 'center-middle') {
		x = (image.width - newWidth) / 2;
		y = (image.height - newHeight) / 2;
	} else if (clipPosition === 'center-bottom') {
		x = (image.width - newWidth) / 2;
		y = image.height - newHeight;
	} else if (clipPosition === 'right-top') {
		x = image.width - newWidth;
		y = 0;
	} else if (clipPosition === 'right-middle') {
		x = image.width - newWidth;
		y = (image.height - newHeight) / 2;
	} else if (clipPosition === 'right-bottom') {
		x = image.width - newWidth;
		y = image.height - newHeight;
	} else if (clipPosition === 'scale') {
		x = 0;
		y = 0;
		newWidth = width;
		newHeight = height;
	} else {
		console.error(
			new Error('Unknown clip position property - ' + clipPosition)
		);
	}

	return {
		cropX: x,
		cropY: y,
		cropWidth: newWidth,
		cropHeight: newHeight,
	};
}

function rem(valueInPx) {
	res = (window.innerWidth / 1440) * valueInPx
	
	if(window.innerWidth == 376){
		res = (window.innerWidth / 376) * valueInPx
	}
	// res =  valueInPx
	return res;
}

function collage(settings, callback) {
	const { images, canvasWrapper, itemsContainers, canvasBG } = settings;
	const canvas = canvasWrapper.children[0];

	const prepareImages = () => {
		itemsContainers.forEach(itemContainer => {
			const imagesTemplate = itemContainer.images.reduce((acc, img) => {
				if (img.type == 'avatar') {
					acc += `
						<div class="collage-avatar collage-item" data-type='${img.type}' data-id='${img.id}' data-border-src='${img.src}'>
							<input class='collage-avatar__input'  type='file'></input>
							<div class='collage-avatar-userpic'>
								<img class='collage-avatar-userpic__img' src=''/>
							</div>
							<img class='collage-avatar__pin' src='${img.srcPin}' />
							<img src='${img.src}'/>
						</div>
					`;

					return acc
				}
				acc += `<img data-id='${img.id}' data-type='${img.type || "image"}' class='collage-item' src='${img.src}'/>`;
				return acc;
			}, '');

			itemContainer.element.innerHTML = imagesTemplate
		});
	}

	function resizeCanvas() {
		canvas.width = canvasWrapper.offsetWidth
		canvas.height = canvasWrapper.offsetHeight;
	}

	function placeBackground() {
		let img = new Image(canvas.width, canvas.height);

		img.onload = function () {
			console.log('img load');
			let bgImg = new Konva.Image({
				name: 'scene-bg',
				x: 0,
				y: 0,
				image: img,
				// width: canvas.width,
				// height: canvas.height,
			});
			misc.add(bgImg);
			layer.batchDraw();
		}

		img.src = canvasBG;
	}

	prepareImages();

	resizeCanvas();

	const stage = new Konva.Stage({
		container: '.cavnas-here',
		width: canvas.width,
		height: canvas.height,
	});

	const misc = new Konva.Group({ name: 'misc' });
	let content = new Konva.Group({ name: 'view' });

	const layer = new Konva.Layer();
	layer.add(misc);

	const transformerSettings = {
		name: 'transformer',
		anchorStroke: 'white',
		anchorFill: 'white',
		anchorSize: 9,
		borderStroke: 'white',
		enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
		nodes: [],
	}

	let transformer;
	transformer = new Konva.Transformer(transformerSettings);
	content.add(transformer);

	layer.add(content);

	placeBackground();

	window.stage = stage


	const addItem = (item) => {
		let img = new Image(item.width, item.height);

		img.onload = function () {
			console.log('img load');
			let canvasImg = new Konva.Image({
				name: 'item',
				x: canvas.width / 2 - (item.width / 2),
				y: canvas.height / 2 - (item.height / 2),
				image: img,
				width: item.width,
				height: item.height,
				draggable: true,
				data: {
					id: item.dataset.id
				}
			});
			content.add(canvasImg);
			transformer.nodes([])
			layer.batchDraw();
		}

		img.src = item.src;
	}

	const addPhoto = (item) => {
		const photo = new Image(item.width, item.height);
		const borderImg = item.parentElement.parentElement.querySelectorAll('img')[2]
		const border = new Image(borderImg.width, borderImg.height);
		const pinImg = item.parentElement.parentElement.querySelector('.collage-avatar__pin');
		const pin = new Image(pinImg.width, pinImg.height);

		border.src = borderImg.src;
		photo.src = item.src;
		pin.src = pinImg.src;

		const group = new Konva.Group({
			name: 'item photo',
			x: canvas.width / 2 - (item.width / 2),
			y: canvas.height / 2 - (item.height / 2),
			draggable: true,
		});

		content.add(group);

		let borderBG;

		new Promise((res, rej) => {
			border.onload = function () {
				console.log('photo-bg');
				let borderBG = new Konva.Image({
					name: 'item photo-bg',
					image: border,
					width: borderImg.width,
					height: borderImg.height,
				});

				group.add(borderBG);

				res(group);
			}
		}).then((r) => {
			return new Promise((res, rej) => {
				console.log('photo-img');
				let photoImg = new Konva.Image({
					name: 'photo-img',
					image: photo,
					width: item.width,
					height: item.height,
					x: rem(12),
					y: rem(13),
				});
			
				// const crop = getCrop(
				// 	photoImg.image(),
				// 	{ width: photoImg.width(), height: photoImg.height() },
				// 	'center-middle'
				// );

				// photoImg.setAttrs(crop)

				group.add(photoImg);
				res(r)
			})
		}).then((r) => {
			return new Promise((res, rej) => {
				console.log('pin-img');
				let pinImg = new Konva.Image({
					name: 'pin-img',
					image: pin,
					width: pin.width,
					height: pin.height,
					x: (borderImg.width / 2) - pin.width / 2,
					y: rem(-24),
				});

				group.add(pinImg);
				res(r)
				layer.batchDraw();
			})
		}).then((r) => {
			layer.batchDraw();
			transformer.nodes([r])
		})
		
	}

	const placeImageToAvatar = (e) => {
		console.dir(e.target);
		e.target.onchange = evt => {
			const [file] = e.target.files
			if (file) {
				if (!(file.type == 'image/png' || file.type == 'image/jpeg')) {
					return console.error('file must be .png or .jpg');
				}

				document.querySelector('.collage-avatar-userpic__img').src = URL.createObjectURL(file);
				e.target.parentNode.classList.add('has-photo')
			}
		}
	}

	// handling item containers
	itemsContainers.forEach(itemContainer => {
		itemContainer.element.addEventListener('click', function (e) {
			if (e.target.classList.contains('collage-item') && !(e.target.classList.contains('active'))) {
				e.target.classList.add('active');
				addItem(e.target);

				return
			}

			if (e.target.classList.contains('collage-avatar__input')) {
				if (!e.target.parentElement.classList.contains('has-photo')) {
					placeImageToAvatar(e);
					return
				}

				e.preventDefault();
				// e.target.parentElement.classList.add('active');
				const userImg = e.target.parentElement.children[1].children[0];
				addPhoto(userImg);

				return
			}
		})
	});


	// handling canvas
	stage.on('click tap dragstart', function (e) {
		let shape = e.target;
		if (shape.name() == 'scene-bg') {
			transformer.visible(false);

			layer.draw();
		}
		if (shape.name() == 'item') {
			console.log('item');
			transformer.nodes([e.target]);
			shape.moveToTop();
			transformer.moveToTop();
			transformer.visible(true);

			layer.draw();
		}

		if(settings.isMobile){
			transformer.visible(false);
		}
	});


	function resetCollage() {
		document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('active'));
		content.destroyChildren();
		layer.draw();

		transformer = new Konva.Transformer(transformerSettings);
		content.add(transformer);
	}

	function makeScreenshot() {
		transformer.visible(false)
		function downloadURI(uri, name) {
			var link = document.createElement('a');
			link.download = name;
			link.href = uri;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			delete link;
		}
		var dataURL = stage.toDataURL();
		downloadURI(dataURL, `collage-${makeid(5)}.png`);
		transformer.visible(true)
	}

	stage.add(layer);

	layer.draw();

	return {
		layer,
		reset: resetCollage,
		makeScreenshot,
	}
}

