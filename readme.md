const settings = {
	images: allImages,
	canvasWrapper: document.querySelector('.cavnas-here'),
	itemsContainers: [
		{
			element: document.querySelectorAll('.collage__items')[0],
			images: imagesLeft
		},
		{
			element: document.querySelectorAll('.collage__items')[1],
			images: imagesRight
		},
	],
	canvasBG: 'img/bg.png',
}

collage(settings, callback)