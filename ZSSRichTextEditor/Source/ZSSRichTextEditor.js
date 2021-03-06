/*!
 *
 * ZSSRichTextEditor v0.5.2
 * http://www.zedsaid.com
 *
 * Copyright 2014 Zed Said Studio LLC
 *
 */

var zss_editor = {};

// If we are using iOS or desktop
zss_editor.isUsingiOS = true;

// If the user is draging
zss_editor.isDragging = false;

// The current selection
zss_editor.currentSelection;

// The current editing image
zss_editor.currentEditingImage;

// The current editing link
zss_editor.currentEditingLink;

// The objects that are enabled
zss_editor.enabledItems = {};

// Height of content window, will be set by viewController
zss_editor.contentHeight = 244;

// Sets to true when extra footer gap shows and requires to hide
zss_editor.updateScrollOffset = false;

/**
 * The initializer function that must be called onLoad
 */
zss_editor.init = function() {
    
    $('#zss_editor_content').on('touchend', function(e) {
                                zss_editor.enabledEditingItems(e);
                                var clicked = $(e.target);
                                if (!clicked.hasClass('zs_active')) {
                                $('img').removeClass('zs_active');
                                }
                                });
    
    $(document).on('selectionchange',function(e){
                   zss_editor.calculateEditorHeightWithCaretPosition();
                   zss_editor.setScrollPosition();
                   });
    
    $(window).on('scroll', function(e) {
                 zss_editor.updateOffset();
                 });
    
    // Make sure that when we tap anywhere in the document we focus on the editor
    $(window).on('touchmove', function(e) {
                 zss_editor.isDragging = true;
                 zss_editor.updateScrollOffset = true;
                 zss_editor.setScrollPosition();
                 });
    $(window).on('touchstart', function(e) {
                 zss_editor.isDragging = false;
                 });
    $(window).on('touchend', function(e) {
                 if (!zss_editor.isDragging && (e.target.id == "zss_editor_footer"||e.target.nodeName.toLowerCase() == "html")) {
                 zss_editor.focusEditor();
                 }
                 });
    
}//end

zss_editor.updateOffset = function() {
    
    if (!zss_editor.updateScrollOffset)
        return;
    
    var offsetY = window.document.body.scrollTop;
    
    var footer = $('#zss_editor_footer');
    
    var maxOffsetY = footer.offset().top - zss_editor.contentHeight;
    
    if (maxOffsetY < 0)
        maxOffsetY = 0;
    
    if (offsetY > maxOffsetY)
    {
        window.scrollTo(0, maxOffsetY);
    }
    
    zss_editor.setScrollPosition();
}

// This will show up in the XCode console as we are able to push this into an NSLog.
zss_editor.debug = function(msg) {
    window.location = 'debug://'+msg;
}


zss_editor.setScrollPosition = function() {
    var position = window.pageYOffset;
    window.location = 'scroll://'+position;
}


zss_editor.setPlaceholder = function(placeholder) {
    
    var editor = $('#zss_editor_content');
    
    //set placeHolder
    if(editor.text().length == 1){
        editor.text(placeholder);
        editor.css("color","gray");
    }
    //set focus
    editor.focus(function(){
                 if($(this).text() == placeholder){
                 $(this).text("");
                 $(this).css("color","black");
                 }
                 }).focusout(function(){
                             if(!$(this).text().length){
                             $(this).text(placeholder);
                             $(this).css("color","gray");
                             }
                             });
    
}

zss_editor.setFooterHeight = function(footerHeight) {
    var footer = $('#zss_editor_footer');
    footer.height(footerHeight + 'px');
}

zss_editor.getCaretYPosition = function() {
    var sel = window.getSelection();
    // Next line is comented to prevent deselecting selection. It looks like work but if there are any issues will appear then uconmment it as well as code above.
    //sel.collapseToStart();
    var range = sel.getRangeAt(0);
    var span = document.createElement('span');// something happening here preventing selection of elements
    range.collapse(false);
    range.insertNode(span);
    var topPosition = span.offsetTop;
    span.parentNode.removeChild(span);
    return topPosition;
}

zss_editor.calculateEditorHeightWithCaretPosition = function() {
    
    var padding = 50;
    var c = zss_editor.getCaretYPosition();
    var e = document.getElementById('zss_editor_content');
    
    var editor = $('#zss_editor_content');
    
    var offsetY = window.document.body.scrollTop;
    var height = zss_editor.contentHeight;
    
    var newPos = window.pageYOffset;
    
    if (c < offsetY) {
        newPos = c;
    } else if (c > (offsetY + height - padding)) {
        var newPos = c - height + padding - 18;
    }
    
    window.scrollTo(0, newPos);
}

zss_editor.backuprange = function(){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    zss_editor.currentSelection = {"startContainer": range.startContainer, "startOffset":range.startOffset,"endContainer":range.endContainer, "endOffset":range.endOffset};
}

zss_editor.restorerange = function(){
    var selection = window.getSelection();
    selection.removeAllRanges();
    var range = document.createRange();
    range.setStart(zss_editor.currentSelection.startContainer, zss_editor.currentSelection.startOffset);
    range.setEnd(zss_editor.currentSelection.endContainer, zss_editor.currentSelection.endOffset);
    selection.addRange(range);
}

zss_editor.getSelectedNode = function() {
    var node,selection;
    if (window.getSelection) {
        selection = getSelection();
        node = selection.anchorNode;
    }
    if (!node && document.selection) {
        selection = document.selection
        var range = selection.getRangeAt ? selection.getRangeAt(0) : selection.createRange();
        node = range.commonAncestorContainer ? range.commonAncestorContainer :
        range.parentElement ? range.parentElement() : range.item(0);
    }
    if (node) {
        return (node.nodeName == "#text" ? node.parentNode : node);
    }
};

zss_editor.setBold = function() {
    document.execCommand('bold', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setItalic = function() {
    document.execCommand('italic', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setSubscript = function() {
    document.execCommand('subscript', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setSuperscript = function() {
    document.execCommand('superscript', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setStrikeThrough = function() {
    document.execCommand('strikeThrough', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setUnderline = function() {
    document.execCommand('underline', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setBlockquote = function() {
    document.execCommand('formatBlock', false, '<blockquote>');
    zss_editor.enabledEditingItems();
}

zss_editor.removeFormating = function() {
    document.execCommand('removeFormat', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setHorizontalRule = function() {
    document.execCommand('insertHorizontalRule', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setHeading = function(heading) {
    var current_selection = $(zss_editor.getSelectedNode());
    var t = current_selection.prop("tagName").toLowerCase();
    var is_heading = (t == 'h1' || t == 'h2' || t == 'h3' || t == 'h4' || t == 'h5' || t == 'h6');
    if (is_heading && heading == t) {
        var c = current_selection.html();
        current_selection.replaceWith(c);
    } else {
        document.execCommand('formatBlock', false, '<'+heading+'>');
    }
    
    zss_editor.enabledEditingItems();
}

zss_editor.setParagraph = function() {
    var current_selection = $(zss_editor.getSelectedNode());
    var t = current_selection.prop("tagName").toLowerCase();
    var is_paragraph = (t == 'p');
    if (is_paragraph) {
        var c = current_selection.html();
        current_selection.replaceWith(c);
    } else {
        document.execCommand('formatBlock', false, '<p>');
    }
    
    zss_editor.enabledEditingItems();
}

// Need way to remove formatBlock
console.log('WARNING: We need a way to remove formatBlock items');

zss_editor.undo = function() {
    document.execCommand('undo', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.redo = function() {
    document.execCommand('redo', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setOrderedList = function() {
    document.execCommand('insertOrderedList', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setUnorderedList = function() {
    document.execCommand('insertUnorderedList', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setJustifyCenter = function() {
    document.execCommand('justifyCenter', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setJustifyFull = function() {
    document.execCommand('justifyFull', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setJustifyLeft = function() {
    document.execCommand('justifyLeft', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setJustifyRight = function() {
    document.execCommand('justifyRight', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setIndent = function() {
    document.execCommand('indent', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setOutdent = function() {
    document.execCommand('outdent', false, null);
    zss_editor.enabledEditingItems();
}

zss_editor.setTextColor = function(color) {
    zss_editor.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('foreColor', false, color);
    document.execCommand("styleWithCSS", null, false);
    zss_editor.enabledEditingItems();
    // document.execCommand("removeFormat", false, "foreColor"); // Removes just foreColor
}

zss_editor.setBackgroundColor = function(color) {
    zss_editor.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('hiliteColor', false, color);
    document.execCommand("styleWithCSS", null, false);
    zss_editor.enabledEditingItems();
}

zss_editor.setFont = function(font) {
    zss_editor.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('fontName', false, font);
    document.execCommand("styleWithCSS", null, false);
    zss_editor.enabledEditingItems();
}

zss_editor.setFontSize = function(size) {
    zss_editor.restorerange();
    document.execCommand("styleWithCSS", null, true);
    document.execCommand('fontSize', false, size);
    document.execCommand("styleWithCSS", null, false);
    zss_editor.enabledEditingItems();
//
//    var sel = document.getSelection();
//    console.log(sel);
//    zss_editor.currentSelection
}

// Needs addClass method

zss_editor.insertLink = function(url, title) {
    
    zss_editor.restorerange();
    var sel = document.getSelection();
    console.log(sel);
    if (sel.toString().length != 0) {
        if (sel.rangeCount) {
            
            var el = document.createElement("a");
            el.setAttribute("href", url);
            el.setAttribute("title", title);
            
            var range = sel.getRangeAt(0).cloneRange();
            range.surroundContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    zss_editor.enabledEditingItems();
}

zss_editor.updateLink = function(url, title) {
    
    zss_editor.restorerange();
    
    if (zss_editor.currentEditingLink) {
        var c = zss_editor.currentEditingLink;
        c.attr('href', url);
        c.attr('title', title);
    }
    zss_editor.enabledEditingItems();
    
}//end

zss_editor.updateImage = function(url, alt) {
    
    zss_editor.restorerange();
    
    if (zss_editor.currentEditingImage) {
        var c = zss_editor.currentEditingImage;
        c.attr('src', url);
        c.attr('alt', alt);
    }
    zss_editor.enabledEditingItems();
    
}//end

zss_editor.unlink = function() {
    
    if (zss_editor.currentEditingLink) {
        var c = zss_editor.currentEditingLink;
        c.contents().unwrap();
    }
    zss_editor.enabledEditingItems();
}

zss_editor.quickLink = function() {
    
    var sel = document.getSelection();
    var link_url = "";
    var test = new String(sel);
    var mailregexp = new RegExp("^(.+)(\@)(.+)$", "gi");
    if (test.search(mailregexp) == -1) {
        checkhttplink = new RegExp("^http\:\/\/", "gi");
        if (test.search(checkhttplink) == -1) {
            checkanchorlink = new RegExp("^\#", "gi");
            if (test.search(checkanchorlink) == -1) {
                link_url = "http://" + sel;
            } else {
                link_url = sel;
            }
        } else {
            link_url = sel;
        }
    } else {
        checkmaillink = new RegExp("^mailto\:", "gi");
        if (test.search(checkmaillink) == -1) {
            link_url = "mailto:" + sel;
        } else {
            link_url = sel;
        }
    }
    
    var html_code = '<a href="' + link_url + '">' + sel + '</a>';
    zss_editor.insertHTML(html_code);
    
}

zss_editor.prepareInsert = function() {
    zss_editor.backuprange();
}

zss_editor.insertImage = function(url, alt) {
    zss_editor.restorerange();
    var html = '<img src="'+url+'" alt="'+alt+'" style="width:100%" />';
    zss_editor.insertHTML(html);
    zss_editor.enabledEditingItems();
}

/**
 *  @brief      Inserts a local image URL.  Useful for images that need to be uploaded.
 *  @details    By inserting a local image URL, we can make sure the image is shown to the user
 *              as soon as it's selected for uploading.  Once the image is successfully uploaded
 *              the application should call replaceLocalImageWithRemoteImage().
 *
 *  @param      imageNodeIdentifier     This is a unique ID provided by the caller.  It exists as
 *                                      a mechanism to update the image node with the remote URL
 *                                      when replaceLocalImageWithRemoteImage() is called.
 *  @param      localImageUrl           The URL of the local image to display.  Please keep in mind
 *                                      that a remote URL can be used here too, since this method
 *                                      does not check for that.  It would be a mistake.
 */
zss_editor.insertLocalImage = function(imageNodeIdentifier, localImageUrl) {
    zss_editor.restorerange();
    var space = '&nbsp';
    var progressIdentifier = this.getImageProgressIdentifier(imageNodeIdentifier);
    var imageContainerIdentifier = this.getImageContainerIdentifier(imageNodeIdentifier);
    var imgContainerStart = '<span id="' + imageContainerIdentifier+'" class="img_container" contenteditable="false" data-failed="Tap to try again!">';
    var imgContainerEnd = '</span>';
    var progress = '<progress id="' + progressIdentifier+'" value=0  class="wp_media_indicator"  contenteditable="false"></progress>';
    var image = '<img data-wpid="' + imageNodeIdentifier + '" src="' + localImageUrl + '" alt="" />';
    var html = imgContainerStart + progress+image + imgContainerEnd;
    html = space + html + space;
    
    this.insertHTML(html);
    this.enabledEditingItems();
};

zss_editor.getImageNodeWithIdentifier = function(imageNodeIdentifier) {
    return $('img[data-wpid="' + imageNodeIdentifier+'"]');
};

zss_editor.getImageProgressIdentifier = function(imageNodeIdentifier) {
    return 'progress_' + imageNodeIdentifier;
};

zss_editor.getImageProgressNodeWithIdentifier = function(imageNodeIdentifier) {
    return $('#'+this.getImageProgressIdentifier(imageNodeIdentifier));
};

zss_editor.getImageContainerIdentifier = function(imageNodeIdentifier) {
    return 'img_container_' + imageNodeIdentifier;
};

zss_editor.getImageContainerNodeWithIdentifier = function(imageNodeIdentifier) {
    return $('#'+this.getImageContainerIdentifier(imageNodeIdentifier));
};

zss_editor.isMediaContainerNode = function(node) {
    if (node.id === undefined) {
        return false;
    }
    return (node.id.search("img_container_") == 0) || (node.id.search("video_container_") == 0);
};

zss_editor.extractMediaIdentifier = function(node) {
    if (node.id.search("img_container_") == 0) {
        return node.id.replace("img_container_", "");
    } else if (node.id.search("video_container_") == 0) {
        return node.id.replace("video_container_", "");
    }
    return "";
};

/**
 *  @brief      Replaces a local image URL with a remote image URL.  Useful for images that have
 *              just finished uploading.
 *  @details    The remote image can be available after a while, when uploading images.  This method
 *              allows for the remote URL to be loaded once the upload completes.
 *
 *  @param      imageNodeIdentifier     This is a unique ID provided by the caller.  It exists as
 *                                      a mechanism to update the image node with the remote URL
 *                                      when replaceLocalImageWithRemoteImage() is called.
 *  @param      remoteImageUrl          The URL of the remote image to display.
 */
zss_editor.replaceLocalImageWithRemoteImage = function(imageNodeIdentifier, remoteImageUrl) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    
    if (imageNode.length == 0) {
        // even if the image is not present anymore we must do callback
        this.markImageUploadDone(imageNodeIdentifier);
        return;
    }
    
    var image = new Image;
    
    image.onload = function () {
        imageNode.attr('src', image.src);
        zss_editor.markImageUploadDone(imageNodeIdentifier);
    }
    
    image.onerror = function () {
        // Even on an error, we swap the image for the time being.  This is because private
        // blogs are currently failing to download images due to access privilege issues.
        //
        imageNode.attr('src', image.src);
        zss_editor.markImageUploadDone(imageNodeIdentifier);
    }
    
    image.src = remoteImageUrl;
};

/**
 *  @brief      Update the progress indicator for the image identified with the value in progress.
 *
 *  @param      imageNodeIdentifier This is a unique ID provided by the caller.
 *  @param      progress    A value between 0 and 1 indicating the progress on the image.
 */
zss_editor.setProgressOnImage = function(imageNodeIdentifier, progress) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    if (imageNode.length == 0){
        return;
    }
    if (progress < 1){
        imageNode.addClass("uploading");
    }
    
    var imageProgressNode = this.getImageProgressNodeWithIdentifier(imageNodeIdentifier);
    if (imageProgressNode.length == 0){
        return;
    }
    imageProgressNode.attr("value",progress);
};

/**
 *  @brief      Notifies that the image upload as finished
 *
 *  @param      imageNodeIdentifier     The unique image ID for the uploaded image
 */
zss_editor.markImageUploadDone = function(imageNodeIdentifier) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    if (imageNode.length > 0){
        // remove identifier attributed from image
        imageNode.removeAttr('data-wpid');
        
        // remove uploading style
        imageNode.removeClass("uploading");
        imageNode.removeAttr("class");
        
        // Remove all extra formatting nodes for progress
        if (imageNode.parent().attr("id") == this.getImageContainerIdentifier(imageNodeIdentifier)) {
            // remove id from container to avoid to report a user removal
            imageNode.parent().attr("id", "");
            imageNode.parent().replaceWith(imageNode);
        }
        // Wrap link around image
        var linkTag = '<a href="' + imageNode.attr("src") + '"></a>';
        imageNode.wrap(linkTag);
    }
    
    var joinedArguments = zss_editor.getJoinedFocusedFieldIdAndCaretArguments();
    zss_editor.callback("callback-input", joinedArguments);
    // We invoke the sendImageReplacedCallback with a delay to avoid for
    // it to be ignored by the webview because of the previous callback being done.
    var thisObj = this;
    setTimeout(function() { thisObj.sendImageReplacedCallback(imageNodeIdentifier);}, 500);
};

/**
 *  @brief      Callbacks to native that the image upload as finished and the local url was replaced by the remote url
 *
 *  @param      imageNodeIdentifier     The unique image ID for the uploaded image
 */
zss_editor.sendImageReplacedCallback = function( imageNodeIdentifier ) {
    var arguments = ['id=' + encodeURIComponent( imageNodeIdentifier )];
    
    var joinedArguments = arguments.join( defaultCallbackSeparator );
    
    this.callback("callback-image-replaced", joinedArguments);
};

/**
 *  @brief      Marks the image as failed to upload
 *
 *  @param      imageNodeIdentifier     This is a unique ID provided by the caller.
 *  @param      message                 A message to show to the user, overlayed on the image
 */
zss_editor.markImageUploadFailed = function(imageNodeIdentifier, message) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    if (imageNode.length == 0){
        return;
    }
    
    var sizeClass = '';
    if ( imageNode[0].width > 480 && imageNode[0].height > 240 ) {
        sizeClass = "largeFail";
    } else if ( imageNode[0].width < 100 || imageNode[0].height < 100 ) {
        sizeClass = "smallFail";
    }
    
    imageNode.addClass('failed');
    
    var imageContainerNode = this.getImageContainerNodeWithIdentifier(imageNodeIdentifier);
    if(imageContainerNode.length != 0){
        imageContainerNode.attr("data-failed", message);
        imageNode.removeClass("uploading");
        imageContainerNode.addClass('failed');
        imageContainerNode.addClass(sizeClass);
    }
    
    var imageProgressNode = this.getImageProgressNodeWithIdentifier(imageNodeIdentifier);
    if (imageProgressNode.length != 0){
        imageProgressNode.addClass('failed');
    }
};

/**
 *  @brief      Unmarks the image as failed to upload
 *
 *  @param      imageNodeIdentifier     This is a unique ID provided by the caller.
 */
zss_editor.unmarkImageUploadFailed = function(imageNodeIdentifier, message) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    if (imageNode.length != 0){
        imageNode.removeClass('failed');
    }
    
    var imageContainerNode = this.getImageContainerNodeWithIdentifier(imageNodeIdentifier);
    if(imageContainerNode.length != 0){
        imageContainerNode.removeAttr("data-failed");
        imageContainerNode.removeClass('failed');
    }
    
    var imageProgressNode = this.getImageProgressNodeWithIdentifier(imageNodeIdentifier);
    if (imageProgressNode.length != 0){
        imageProgressNode.removeClass('failed');
    }
};

/**
 *  @brief      Remove the image from the DOM.
 *
 *  @param      imageNodeIdentifier     This is a unique ID provided by the caller.
 */
zss_editor.removeImage = function(imageNodeIdentifier) {
    var imageNode = this.getImageNodeWithIdentifier(imageNodeIdentifier);
    if (imageNode.length != 0){
        imageNode.remove();
    }
    // if image is inside options container we need to remove the container
    var imageContainerNode = this.getImageContainerNodeWithIdentifier(imageNodeIdentifier);
    if (imageContainerNode.length != 0){
        //reset id before removal to avoid detection of user removal
        imageContainerNode.attr("id","");
        imageContainerNode.remove();
    }
};

/**
 *  @brief      Callbacks to native that the media container was deleted by the user
 *
 *  @param      mediaNodeIdentifier     The unique media ID
 */
zss_editor.sendMediaRemovedCallback = function(mediaNodeIdentifier) {
    var arguments = ['id=' + encodeURIComponent(mediaNodeIdentifier)];
    var joinedArguments = arguments.join(defaultCallbackSeparator);
    this.callback("callback-media-removed", joinedArguments);
};

zss_editor.setHTML = function(html) {
    var editor = $('#zss_editor_content');
    editor.html(html);
}

zss_editor.insertHTML = function(html) {
    document.execCommand('insertHTML', false, html);
    zss_editor.enabledEditingItems();
}

zss_editor.getHTML = function() {
    
    // Images
    var img = $('img');
    if (img.length != 0) {
        $('img').removeClass('zs_active');
        $('img').each(function(index, e) {
                      var image = $(this);
                      var zs_class = image.attr('class');
                      if (typeof(zs_class) != "undefined") {
                      if (zs_class == '') {
                      image.removeAttr('class');
                      }
                      }
                      });
    }
    
    // Blockquote
    var bq = $('blockquote');
    if (bq.length != 0) {
        bq.each(function() {
                var b = $(this);
                if (b.css('border').indexOf('none') != -1) {
                b.css({'border': ''});
                }
                if (b.css('padding').indexOf('0px') != -1) {
                b.css({'padding': ''});
                }
                });
    }
    

    var listFont = [{n:'x-small',s:'10px'},{n:'small',s:'12px'},{n:'medium',s:'16px'},{n:'large',s:'18px'},{n:'x-large',s:'24px'},{n:'xx-large',s:'32px'},{n:'-webkit-xxx-large',s:'48px'}];
    
    // Font
    var html = document.getElementById("zss_editor_content").innerHTML;
    
    function font2style(all,tag,attrs,content)
    {
        if(!attrs)return content;
        var styles='',f,s,c,style;
        attrs=attrs.replace(/ face\s*=\s*"\s*([^"]*)\s*"/i,function(all,v){
            if(v)styles+='font-family:'+v+';';
            return '';
        });
        attrs=attrs.replace(/ size\s*=\s*"\s*(\d+)\s*"/i,function(all,v){
            styles+='font-size:'+listFont[(v>7?7:(v<1?1:v))-1].s+';';
            return '';
        });
        attrs=attrs.replace(/ color\s*=\s*"\s*([^"]*)\s*"/i,function(all,v){
            if(v)styles+='color:'+v+';';
            return '';
        });
        attrs=attrs.replace(/ style\s*=\s*"\s*([^"]*)\s*"/i,function(all,v){
            if(v)styles+=v;
            return '';
        });
        attrs+=' style="'+styles+'"';
        return attrs?('<span'+attrs+'>'+content+'</span>'):content;
    }
    html = html.replace(/<(font)(\s+[^>]*?)?>(((?!<\1(\s+[^>]*?)?>)[\s\S]|<\1(\s+[^>]*?)?>((?!<\1(\s+[^>]*?)?>)[\s\S]|<\1(\s+[^>]*?)?>((?!<\1(\s+[^>]*?)?>)[\s\S])*?<\/\1>)*?<\/\1>)*?)<\/\1>/ig,font2style);//第3层
    html = html.replace(/<(font)(\s+[^>]*?)?>(((?!<\1(\s+[^>]*?)?>)[\s\S]|<\1(\s+[^>]*?)?>((?!<\1(\s+[^>]*?)?>)[\s\S])*?<\/\1>)*?)<\/\1>/ig,font2style);//第2层
    html = html.replace(/<(font)(\s+[^>]*?)?>(((?!<\1(\s+[^>]*?)?>)[\s\S])*?)<\/\1>/ig,font2style);//最里层
    html = html.replace(/^(\s*\r?\n)+|(\s*\r?\n)+$/g,'');//清理首尾换行
    
    html = html.replace(/(<(\w+))((?:\s+[\w\-:]+\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))*)\s*(\/?>)/g, function(all,left,tag,attr,right){        
        tag=tag.toLowerCase();
        var saveValue;
        attr=attr.replace(/\s+([\w\-:]+)\s*=\s*("[^"]*"|'[^']*'|[^>\s]+)/g, function(all,n,v){
            n=n.toLowerCase();
            v=v.match(/^(["']?)(.*)\1/)[2].replace(/"/g,"'");
            if(n==='style'){//转换font-size的keyword到px单位
                v=v.replace(/(^|;)\s*(font-size)\s*:\s*([a-z-]+)\s*(;|$)/i,function(all,left,n,v,right){
                    var t,s;
                    for(var i=0;i<listFont.length;i++)
                    {
                        t=listFont[i];
                        if(v===t.n){s=t.s;break;}
                    }
                    return left+n+':'+s+right;
                });
            }
            return ' '+n+'="'+v+'"';
        });

        return left+attr+right;
    });
    
    
    // Get the contents
//    var h = document.getElementById("zss_editor_content").innerHTML;
    
    return html;
}

zss_editor.getText = function() {
    return $('#zss_editor_content').text();
}

zss_editor.isCommandEnabled = function(commandName) {
    return document.queryCommandState(commandName);
}

zss_editor.enabledEditingItems = function(e) {
    
    console.log('enabledEditingItems');
    var items = [];
    if (zss_editor.isCommandEnabled('bold')) {
        items.push('bold');
    }
    if (zss_editor.isCommandEnabled('italic')) {
        items.push('italic');
    }
    if (zss_editor.isCommandEnabled('subscript')) {
        items.push('subscript');
    }
    if (zss_editor.isCommandEnabled('superscript')) {
        items.push('superscript');
    }
    if (zss_editor.isCommandEnabled('strikeThrough')) {
        items.push('strikeThrough');
    }
    if (zss_editor.isCommandEnabled('underline')) {
        items.push('underline');
    }
    if (zss_editor.isCommandEnabled('insertOrderedList')) {
        items.push('orderedList');
    }
    if (zss_editor.isCommandEnabled('insertUnorderedList')) {
        items.push('unorderedList');
    }
    if (zss_editor.isCommandEnabled('justifyCenter')) {
        items.push('justifyCenter');
    }
    if (zss_editor.isCommandEnabled('justifyFull')) {
        items.push('justifyFull');
    }
    if (zss_editor.isCommandEnabled('justifyLeft')) {
        items.push('justifyLeft');
    }
    if (zss_editor.isCommandEnabled('justifyRight')) {
        items.push('justifyRight');
    }
    if (zss_editor.isCommandEnabled('insertHorizontalRule')) {
        items.push('horizontalRule');
    }
    if (zss_editor.isCommandEnabled('fontName')) {
        items.push('fontName');
    }
    if (zss_editor.isCommandEnabled('insertImage')) {
        items.push('insertImage');
    }
    if (zss_editor.isCommandEnabled('fontSize')) {
        items.push('fontSize');
    }
    
    var formatBlock = document.queryCommandValue('formatBlock');
    if (formatBlock.length > 0) {
        items.push(formatBlock);
    }
    // Images
//    $('img').bind('touchstart', function(e) {
//                  $('img').removeClass('zs_active');
//                  $(this).addClass('zs_active');
//                  });
    
    // Use jQuery to figure out those that are not supported
    if (typeof(e) != "undefined") {
        
        // The target element
        var t = $(e.target);
        var nodeName = e.target.nodeName.toLowerCase();
        
        // Background Color
        var bgColor = t.css('backgroundColor');
        if (bgColor.length != 0 && bgColor != 'rgba(0, 0, 0, 0)' && bgColor != 'rgb(0, 0, 0)' && bgColor != 'transparent') {
            items.push('backgroundColor');
        }
        // Text Color
        var textColor = t.css('color');
        if (textColor.length != 0 && textColor != 'rgba(0, 0, 0, 0)' && textColor != 'rgb(0, 0, 0)' && textColor != 'transparent') {
            items.push('textColor');
        }
        // Link
        if (nodeName == 'a') {
            zss_editor.currentEditingLink = t;
            var title = t.attr('title');
            items.push('link:'+t.attr('href'));
            if (t.attr('title') !== undefined) {
                items.push('link-title:'+t.attr('title'));
            }
            
        } else {
            zss_editor.currentEditingLink = null;
        }
        // Blockquote
        if (nodeName == 'blockquote') {
            items.push('indent');
        }
        // Image
        if (nodeName == 'img') {
            zss_editor.currentEditingImage = t;
            items.push('image:'+t.attr('src'));
            if (t.attr('alt') !== undefined) {
                items.push('image-alt:'+t.attr('alt'));
            }
            
        } else {
            zss_editor.currentEditingImage = null;
        }
        
    }
    
    if (items.length > 0) {
        if (zss_editor.isUsingiOS) {
            //window.location = "zss-callback/"+items.join(',');
            window.location = "callback://0/"+items.join(',');
        } else {
            console.log("callback://"+items.join(','));
        }
    } else {
        if (zss_editor.isUsingiOS) {
            window.location = "zss-callback/";
        } else {
            console.log("callback://");
        }
    }
    
}

zss_editor.focusEditor = function() {
    
    // the following was taken from http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity/3866442#3866442
    // and ensures we move the cursor to the end of the editor
    var editor = $('#zss_editor_content');
    var range = document.createRange();
    range.selectNodeContents(editor.get(0));
    range.collapse(false);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();
}

zss_editor.blurEditor = function() {
    $('#zss_editor_content').blur();
}//end
