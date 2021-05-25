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
	let k = 1440;
	if(window.innerWidth <= 376){
		k = 376
	}
	let rem = (window.innerWidth / k) * valueInPx

	return rem;
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
								<img class='collage-avatar-userpic__img'  src='' />
							</div>
							<img class='collage-avatar__pin' src='${img.srcPin}' />
							<img class='collage-avatar__border' src='${img.src}'/>
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
		new Promise((res, rej) => {
			let img = new Image(canvas.width, canvas.height);
			img.src = canvasBG;
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
				res();
			}
		}).then(() => {
			new Promise((res, rej) => {
				let img = new Image(60, 60);
				img.src = document.querySelector('.collage-hidden__trash').src;
				let w = 60;
				let h = 60;

				img.onload = function () {
					let canvImg = new Konva.Image({
						name: 'trash',
						x: rem(20),
						y: canvas.height - h - rem(20),
						image: img,
						width: w,
						height: h,
						opacity: 0,
					});
					if(settings.isMobile){
						canvImg.x(canvas.width / 2 - (w / 2));
						canvImg.y(canvas.height - h - rem(13))
					}
					misc.add(canvImg);
					layer.batchDraw();
				}


			})
		})

	}

	function toggleTrash(state = 'hide'){
		if(state == 'hide'){
			stage.find('.trash').opacity(0)
		}
		if(state == 'show'){
			stage.find('.trash').opacity(1)
		}

		layer.draw();
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
		const borderImg = item.parentElement.parentElement.querySelector('.collage-avatar__border');
		const border = new Image(borderImg.width, borderImg.height);
		const pinImg = item.parentElement.parentElement.querySelector('.collage-avatar__pin');
		const pin = new Image(pinImg.width, pinImg.height);

		border.src = borderImg.src;
		photo.src = item.src;

		//debug
		// photo.src = 'img/6CbzmM-CLzU.jpg';
		
		pin.src = pinImg.src;
		// transformer.nodes([])

		const group = new Konva.Group({
			name: 'item photo',
			x: canvas.width / 2 - (item.width / 2),
			y: canvas.height / 2 - (item.height / 2),
			draggable: true,
			data: {
				id: item.parentElement.parentElement.dataset.id
			}
		});

		content.add(group);

		let borderBG;

		new Promise((res, rej) => {
			border.onload = function () {
				console.log('photo-bg');
				let borderBG = new Konva.Image({
					name: 'photo photo-bg',
					image: border,
					width: rem(157),
					height: rem(157),
				});

				group.add(borderBG);

				res(group);
			}
		}).then((r) => {
			console.log(item);
			console.log(item.parentElement.width);
			console.log(item.height);
			return new Promise((res, rej) => {
				console.log('photo-img');
				let photoImg = new Konva.Image({
					name: 'photo photo-img',
					image: photo,
					x: rem(10),
					y: rem(9),
					width: rem(139),
					height: rem(129),
				});

				console.log(photoImg.image());
				const newCrop = getCrop(
					photo,
					{ width: photoImg.width(), height: photoImg.height() },
					'center-middle'
				);
				
				console.log(newCrop);
				console.log(photoImg);

				photoImg.setAttrs(newCrop)

				group.add(photoImg);
				res(r)
			})
		}).then((r) => {
			return new Promise((res, rej) => {
				console.log('pin-img');
				let pinImg = new Konva.Image({
					name: 'photo pin-img',
					image: pin,
					width: pin.width,
					height: pin.height,
					x: (r.find('.photo-bg')[0].width() / 2) - pin.width / 2,
					y: rem(-30),
				});

				group.add(pinImg);
				res(r)
				layer.batchDraw();
			})
		}).then((r) => {
			layer.batchDraw();
			r.width(r.getClientRect().width)
			r.height(r.getClientRect().height)
			// transformer.nodes([r])
		})

	}

	const touchScale = (canvasItem) => {
		canvasItem.on('touchmove', function (e) {
			e.evt.preventDefault();
			var touch1 = e.evt.touches[0];
			var touch2 = e.evt.touches[1];

			if (touch1 && touch2) {
				// if the stage was under Konva's drag&drop
				// we need to stop it, and implement our own pan logic with two pointers
				if (canvasItem.isDragging()) {
					canvasItem.stopDrag();
				}

				var p1 = {
					x: touch1.clientX,
					y: touch1.clientY,
				};
				var p2 = {
					x: touch2.clientX,
					y: touch2.clientY,
				};

				if (!lastCenter) {
					lastCenter = getCenter(p1, p2);
					return;
				}
				var newCenter = getCenter(p1, p2);

				var dist = getDistance(p1, p2);

				if (!lastDist) {
					lastDist = dist;
				}

				// local coordinates of center point
				var pointTo = {
					x: (newCenter.x - canvasItem.x()) / canvasItem.scaleX(),
					y: (newCenter.y - canvasItem.y()) / canvasItem.scaleX(),
				};

				var scale = canvasItem.scaleX() * (dist / lastDist);

				canvasItem.scaleX(scale);
				canvasItem.scaleY(scale);

				// calculate new position of the stage
				var dx = newCenter.x - lastCenter.x;
				var dy = newCenter.y - lastCenter.y;

				var newPos = {
					x: newCenter.x - pointTo.x * scale + dx,
					y: newCenter.y - pointTo.y * scale + dy,
				};

				canvasItem.position(newPos);

				lastDist = dist;
				lastCenter = newCenter;
			}
		});

		canvasItem.on('touchend', function () {
			lastDist = 0;
			lastCenter = null;
		});
	}

	const placeImageToAvatar = (e) => {
		console.log(e.target);
		e.target.onchange = evt => {
			const [file] = e.target.files
			if (file) {
				if (!(file.type == 'image/png' || file.type == 'image/jpeg')) {
					return console.error('file must be .png or .jpg');
				}

				e.target.parentElement.querySelector('.collage-avatar-userpic__img').src = URL.createObjectURL(file);
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
				e.target.parentElement.classList.add('active');
				const userImg = e.target.parentElement.children[1].children[0];

				addPhoto(userImg);

				return
			}
		})
	});

	// handling canvas 
	stage.on('click tap dragstart', function (e) {
		let shape = e.target;
		console.log(shape);
		if (shape.hasName('scene-bg')) {
			transformer.visible(false);
			toggleTrash('hide');
		}
		
		if (shape.hasName('item')) {
			stage.find('.item').removeName('active');
			console.log(shape);
			shape.addName('active');
			transformer.nodes([e.target]);
			shape.moveToTop();
			transformer.moveToTop();
			transformer.visible(true);
			toggleTrash('show');
			
			layer.draw();
		}
		
		if(shape.hasName('photo')){
			console.log(shape.findAncestor('.item'));
			let photo = shape.findAncestor('.item', true);
			
			console.log(photo);
			photo.addName('active');
			toggleTrash('show');
			
			transformer.nodes([photo]);
			transformer.visible(true);
			layer.draw();

			return
		}
		
		if(shape.name() == 'trash'){
			let activeNode = stage.find((node) => {
				return node.hasName('item') && node.hasName('active');
			})[0];
			console.log(activeNode);
			document.querySelector(`[data-id='${activeNode.attrs.data.id}']`).classList.remove('active');
			activeNode.destroy();
			console.log(shape);
			transformer.nodes([]);
			toggleTrash('hide');

			layer.draw();
		} 
		
		layer.draw();

	});


	function resetCollage() {
		document.querySelectorAll('.collage-item').forEach(el => el.classList.remove('active'));
		content.destroyChildren();
		layer.draw();

		document.querySelectorAll('.collage-item').forEach(el => {
			el.classList.remove('has-photo');
		})

		transformer = new Konva.Transformer(transformerSettings);
		content.add(transformer);
	}

	function makeScreenshot(callback) {
		transformer.visible(false)
		var dataURL = stage.toDataURL();
		transformer.visible(true);
		toggleTrash('hide');

		if (callback) {
			callback(dataURL);
		}
	}

	stage.add(layer);

	layer.draw();

	return {
		layer,
		reset: resetCollage,
		makeScreenshot,
	}
}

