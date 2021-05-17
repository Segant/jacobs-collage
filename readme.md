
```
const allImages = [
	{
		src: 'img/avatar.png',
		id: 11,
		type: 'avatar',
	},
	{
		src: 'img/1.png',
		id: 1,
	},
	{
		src: 'img/2.png',
		id: 2,
	},
]

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
```