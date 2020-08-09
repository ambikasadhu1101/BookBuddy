FilePond.registerPlugin(
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
    FilePondPluginImagePreview)
FilePond.setOptions({
    stylePanelAspectRation: 150/100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
})
FilePond.parse(document.body)