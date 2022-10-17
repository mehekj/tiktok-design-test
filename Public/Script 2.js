//@input Component.Camera orthoCam
//@input Component.ScreenTransform bg
//@input Component.ScreenTransform[] imgTransforms
//@input Asset.Texture[] cropTextures

var columns = 4
var rows = 6

var imgArray = []

var imgWidth = 2 / columns
var imgHeight = 2 / rows

var screenWidth = script.orthoCam.getOrthographicSize().x
var screenHeight = script.orthoCam.getOrthographicSize().y

var imgScreenWidth = screenWidth / columns
var imgScreenHeight = screenHeight / rows

var tapEvent = script.createEvent("TapEvent")
tapEvent.bind(onTap)
var tapping = false

var touchStartEvent = script.createEvent("TouchStartEvent")
touchStartEvent.bind(onPointerDown)

var touchMoveEvent = script.createEvent("TouchMoveEvent")
touchMoveEvent.bind(onPointerMove)

var touchEndEvent = script.createEvent("TouchEndEvent")
touchEndEvent.bind(onPointerUp)

var draggedIndex = 0
var draggedImage = script.imgTransforms[0]

global.touchSystem.touchBlocking = true

function genDefaultGrid() {
    for (var i = 0; i < columns; i++) {
        for (var j = 0; j < rows; j++) {
            var currIndex = rowColToIndex(i, j)
            
            var currImage = script.imgTransforms[currIndex]
            currImage.scale = new vec3(1, 1, 1)
            currImage.anchors = rowColToRect(i, j)
            imgArray[currIndex] = currImage
            
            var currCrop = script.cropTextures[currIndex]
            currCrop.control.cropRect = rowColToRect(i, j)
        }
    }
}

function onPointerDown(event) {
    if (!tapping) {
        var touchPos = event.getTouchPosition()
    draggedIndex = touchPosToIndex(touchPos.x, touchPos.y)
    draggedImage = imgArray[draggedIndex]
    draggedImage.getSceneObject().getComponent("Component.MaterialMeshVisual").setRenderOrder(rows * columns + 1)
    }
}

function onPointerMove(event) {
    if (!tapping) {
        var touchPos = event.getTouchPosition()
        var converted = script.bg.screenPointToParentPoint(touchPos)
        draggedImage.anchors.setCenter(converted)
    }
}

function onPointerUp(event) {
    if (!tapping) {
        var touchPos = event.getTouchPosition()
        var newIndex = touchPosToIndex(touchPos.x, touchPos.y)
        var newImage = imgArray[newIndex]
        
        swapImages(draggedIndex, draggedImage, newIndex, newImage)
        draggedImage.getSceneObject().getComponent("Component.MaterialMeshVisual").setRenderOrder(0)
        newImage.getSceneObject().getComponent("Component.MaterialMeshVisual").setRenderOrder(0)
    }
    else {
        tapping = false
    }
}

function onTap(event) {
    genDefaultGrid()
    tapping = true
}

function swapImages(index1, img1, index2, img2) {
    imgArray[index1] = img2
    imgArray[index2] = img1
    
    var coords1 = indexToRowCol(index1)
    img2.anchors = rowColToRect(coords1.x, coords1.y)
    
    var coords2 = indexToRowCol(index2)
    img1.anchors = rowColToRect(coords2.x, coords2.y)
}

function rowColToRect(x, y) {
    return Rect.create(
        -1 + x * imgWidth,
        -1 + (x + 1) * imgWidth,
        1 - (y + 1) * imgHeight,
        1 - y * imgHeight)
}

function touchPosToIndex(x, y) {
    return Math.floor(y * rows) * columns + Math.floor(x * columns)
}

function rowColToIndex(x, y) {
    return y * columns + x
}

function indexToRowCol(i) {
    return {"x": i % columns, "y": Math.floor(i / columns)}
}

genDefaultGrid()