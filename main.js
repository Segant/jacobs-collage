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

function collage(settings, callback) {
	const { images, canvasWrapper, itemsContainers, canvasBG } = settings;
	const canvas = canvasWrapper.children[0];

	const prepareImages = () => {
		itemsContainers.forEach(itemContainer => {
			const imagesTemplate = itemContainer.images.reduce((acc, img) => {
				if (img.type == 'avatar') {
					acc += `
						<div class="collage-avatar">
							<div class='collage-avatar-userpic'></div>
							<img data-id='${img.id}' data-type='${img.type || "image"}' class='collage-item' src='${img.src}'/>
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

	function prepareCanvas() {
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
		anchorSize: 10,
		borderStroke: 'white',
		// borderDash: [3, 3],
		enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
		nodes: [],
	}

	let transformer;
	transformer = new Konva.Transformer(transformerSettings);
	content.add(transformer);

	layer.add(content);

	prepareCanvas();

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

	}

	const placeImageToAvatar = () => {

	}

	itemsContainers.forEach(itemContainer => {
		itemContainer.element.addEventListener('click', function (e) {
			if (e.target.classList.contains('collage-item') && !(e.target.classList.contains('active'))) {
				if (e.target.dataset.type == 'avatar') {
					// e.target.classList.contains('has-photo')
					return
				}

				e.target.classList.add('active');
				addItem(e.target);
			}
		})
	});

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

