//
//  ZSSRichTextEditor+EApple.m
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 12/30/15.
//  Copyright © 2015 Zed Said Studio. All rights reserved.
//

#import "ZSSRichTextEditor+EApple.h"
#import "ZSSBarButtonItem.h"
#import "UIImagePickerController+Block.h"

#import <ActionSheetPicker-3.0/ActionSheetPicker.h>
#import <JGActionSheet/JGActionSheet.h>
#import <objc/runtime.h>

@implementation ZSSRichTextEditor (EApple)

static void *imagesAddedKey = &imagesAddedKey;

- (NSMutableDictionary *)imagesAdded
{
    return objc_getAssociatedObject(self, imagesAddedKey);
}

- (void)setImagesAdded:(NSMutableDictionary *)imagesAdded
{
    objc_setAssociatedObject(self, imagesAddedKey, imagesAdded, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (void)setupToolbar
{
    self.enabledToolbarItems = @[ZSSRichTextEditorToolbarUndo, ZSSRichTextEditorToolbarRedo, ZSSRichTextEditorToolbarBold,
                                 ZSSRichTextEditorToolbarItalic, ZSSRichTextEditorToolbarStrikeThrough, ZSSRichTextEditorToolbarUnderline,
                                 ZSSRichTextEditorToolbarJustifyLeft, ZSSRichTextEditorToolbarJustifyCenter, ZSSRichTextEditorToolbarJustifyRight,
                                 ZSSRichTextEditorToolbarTextColor, ZSSRichTextEditorToolbarBackgroundColor,
                                 ZSSRichTextEditorToolbarUnorderedList, ZSSRichTextEditorToolbarOrderedList, ZSSRichTextEditorToolbarOrderedList,
                                 ZSSRichTextEditorToolbarInsertLink, ZSSRichTextEditorToolbarRemoveLink, ZSSRichTextEditorToolbarRemoveFormat,
                                 ZSSRichTextEditorToolbarViewSource];
    
    ZSSBarButtonItem *hItem = [[ZSSBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"ZSSh1.png"] style:UIBarButtonItemStylePlain target:self action:@selector(didTapHButton:)];
    [self addCustomToolbarItem:hItem];
    
    ZSSBarButtonItem *fontItem = [[ZSSBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"ZSTextFont.png"] style:UIBarButtonItemStylePlain target:self action:@selector(didTapFontButton:)];
    [self addCustomToolbarItem:fontItem];
    
    ZSSBarButtonItem *imageItem = [[ZSSBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"ZSSimage.png"] style:UIBarButtonItemStylePlain target:self action:@selector(didTapImageButton:)];
    [self addCustomToolbarItem:imageItem];
    
    self.imagesAdded = [[NSMutableDictionary alloc] init];
}

- (void)didTapFontButton:(id)sender
{
    // Save the selection location
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:@"zss_editor.prepareInsert();"];
    [self blurTextEditor];
    
    NSArray *fontVal = @[@"Arial",
                         @"'Arial Black'",
                         @"Impact",
                         @"Tahoma",
                         @"Verdana",
                         @"Courier New",
                         @"Times New Roman",
                         @"Georgia, serif"];
    NSMutableArray *fontNames = [NSMutableArray array];
    for (NSString *val in fontVal) {
        NSString *name = [[val componentsSeparatedByString:@","] firstObject];
        name = [name stringByReplacingOccurrencesOfString:@"'" withString:@""];
        [fontNames addObject:name];
    }
    
    NSArray *fontSizes = @[@"10", @"12", @"16", @"18", @"24", @"32", @"48"];
    NSArray *fontSizesReal = @[@1, @2, @3, @4, @5, @6, @7];
    
    NSArray *options = @[fontNames, fontSizes];
    
    [ActionSheetMultipleStringPicker showPickerWithTitle:@"选择字体" rows:options initialSelection:@[@0, @2] doneBlock:^(ActionSheetMultipleStringPicker *picker, NSArray *selectedIndexes, NSArray *selectedValues) {
        [self focusTextEditor];
        
        NSString *fontValue = nil;
        NSString *selectedFont = [selectedValues firstObject];
        for (NSString *val in fontVal) {
            NSString *name = [[val componentsSeparatedByString:@","] firstObject];
            name = [name stringByReplacingOccurrencesOfString:@"'" withString:@""];
            if([name isEqualToString:selectedFont]){
                fontValue = val;
                break;
            }
        }
        
        if(fontValue){
            NSString *trigger = [NSString stringWithFormat:@"zss_editor.setFont(\"%@\");", fontValue];
            [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
        }
        
        NSInteger selectedSizeIndex = [[selectedIndexes lastObject] integerValue];
        NSString *trigger = [NSString stringWithFormat:@"zss_editor.setFontSize(%@);", fontSizesReal[selectedSizeIndex]];
        [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
        
        
    } cancelBlock:^(ActionSheetMultipleStringPicker *picker) {
        //
        [self focusTextEditor];
    } origin:sender];
}

- (void)didTapHButton:(id)sender
{
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:@"zss_editor.prepareInsert();"];
    [self blurTextEditor];
    
    NSArray *hArray = @[@"P", @"H1", @"H2", @"H3", @"H4", @"H5", @"H6"];
    [ActionSheetStringPicker showPickerWithTitle:@"段落" rows:hArray initialSelection:0 doneBlock:^(ActionSheetStringPicker *picker, NSInteger selectedIndex, id selectedValue) {
        [self focusTextEditor];
        
        if(selectedIndex==0){
            NSString *trigger = @"zss_editor.setParagraph();";
            [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
        }else{
            NSString *trigger = [NSString stringWithFormat:@"zss_editor.setHeading(\"%@\");", [selectedValue lowercaseString]];
            [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
        }
        
    } cancelBlock:^(ActionSheetStringPicker *picker) {
        //
        [self focusTextEditor];
    } origin:sender];
}

- (void)didTapImageButton:(id)sender
{
    
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:@"zss_editor.prepareInsert();"];
    [self blurTextEditor];
    
    JGActionSheetSection *section1 = [JGActionSheetSection sectionWithTitle:@"选择图片" message:nil buttonTitles:@[@"拍照", @"相册选取"] buttonStyle:JGActionSheetButtonStyleDefault];
    JGActionSheetSection *cancelSection = [JGActionSheetSection sectionWithTitle:nil message:nil buttonTitles:@[@"Cancel"] buttonStyle:JGActionSheetButtonStyleCancel];
    
    NSArray *sections = @[section1, cancelSection];
    
    JGActionSheet *sheet = [JGActionSheet actionSheetWithSections:sections];
    
    [sheet setButtonPressedBlock:^(JGActionSheet *sheet, NSIndexPath *indexPath) {
        if(indexPath.section==0){
            if(indexPath.row==0){
                if(![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]){
                    NSLog(@"Image picker source type is not available.");
                    return;
                }
                
                UIImagePickerController *vc = [[UIImagePickerController alloc] init];
                vc.allowsEditing = YES;
                vc.sourceType = UIImagePickerControllerSourceTypeCamera;
                [vc setFinalizationBlock:^(UIImagePickerController *picker, NSDictionary *info){
                    [self saveImages:info];
                    [self dismissViewControllerAnimated:YES completion:nil];
                    [self focusTextEditor];
                }];
                
                [vc setCancellationBlock:^(UIImagePickerController *picker){
                    [self dismissViewControllerAnimated:YES completion:nil];
                    [self focusTextEditor];
                }];
                [self presentViewController:vc animated:YES completion:nil];
                
                
            }else if(indexPath.row==1){
                if(![UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypePhotoLibrary]){
                    NSLog(@"Image picker source type is not available.");
                    return;
                }
                
                UIImagePickerController *vc = [[UIImagePickerController alloc] init];
                vc.allowsEditing = YES;
                vc.sourceType = UIImagePickerControllerSourceTypePhotoLibrary;
                [vc setFinalizationBlock:^(UIImagePickerController *picker, NSDictionary *info){
                    [self saveImages:info];
                    [self dismissViewControllerAnimated:YES completion:nil];
                    [self focusTextEditor];
                }];
                
                [vc setCancellationBlock:^(UIImagePickerController *picker){
                    [self dismissViewControllerAnimated:YES completion:nil];
                    [self focusTextEditor];
                }];
                [self presentViewController:vc animated:YES completion:nil];
            }
        }else{
            [self focusTextEditor];
        }
        [sheet dismissAnimated:YES];
    }];
    
    [sheet showInView:self.view animated:YES];
}

- (void)saveImages:(NSDictionary<NSString *,id> *)info
{
    UIImage *orginalImage = info[UIImagePickerControllerEditedImage];
    NSData *imageData = UIImageJPEGRepresentation(orginalImage, 0.5f);
    ;
    NSString *imageId = [[NSUUID UUID] UUIDString];
    NSString *filename = [NSString stringWithFormat:@"%@.jpg", imageId];
    
    NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:filename];
    
    [imageData writeToFile:path atomically:YES];
    
    //    NSURL *url = [info objectForKey:UIImagePickerControllerReferenceURL];
//    [self.localImages addObject:fileUrl.absoluteString];
//    [self insertImage:fileUrl.absoluteString alt:@""];
    [self insertLocalImage:[NSURL fileURLWithPath:path].absoluteString uniqueId:imageId];
    
//    NSProgress *progress = [[NSProgress alloc] initWithParent:nil userInfo:@{@"imageID": imageId,
//                                                                             @"url": path}];
//    progress.cancellable = YES;
//    progress.totalUnitCount = 100;
//    NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:0.1 target:self selector:@selector(timerFired:) userInfo:progress repeats:YES];
//    [progress setCancellationHandler:^{
//        [timer invalidate];
//    }];
//    self.imagesAdded[imageId] = progress;
    
    ZSSImage *image = [[ZSSImage alloc] init];
    image.localPath = path;
    image.imageId = imageId;
    
    self.imagesAdded[imageId] = image;
    [self needUploadImage:image];
}

- (void)needUploadImage:(ZSSImage *)image
{
    NSProgress *progress = [[NSProgress alloc] initWithParent:nil userInfo:@{@"image":image}];
    progress.cancellable = YES;
    progress.totalUnitCount = 100;
    NSTimer *timer = [NSTimer scheduledTimerWithTimeInterval:0.1 target:self selector:@selector(timerFired:) userInfo:progress repeats:YES];
    [progress setCancellationHandler:^{
        [timer invalidate];
    }];
}

#pragma mark - Images

- (void)insertLocalImage:(NSString*)url uniqueId:(NSString*)uniqueId
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.insertLocalImage(\"%@\", \"%@\");", uniqueId, url];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

- (void)replaceLocalImageWithRemoteImage:(NSString*)url uniqueId:(NSString*)uniqueId
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.replaceLocalImageWithRemoteImage(\"%@\", \"%@\");", uniqueId, url];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

- (void)setProgress:(double) progress onImage:(NSString*)uniqueId
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.setProgressOnImage(\"%@\", %f);", uniqueId, progress];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

- (void)markImage:(NSString *)uniqueId failedUploadWithMessage:(NSString*) message;
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.markImageUploadFailed(\"%@\", \"%@\");", uniqueId, message];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

- (void)unmarkImageFailedUpload:(NSString *)uniqueId
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.unmarkImageUploadFailed(\"%@\");", uniqueId];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

- (void)removeImage:(NSString*)uniqueId
{
    NSString *trigger = [NSString stringWithFormat:@"zss_editor.removeImage(\"%@\");", uniqueId];
    [[self getEditorView] stringByEvaluatingJavaScriptFromString:trigger];
}

#pragma mark - 

- (void)timerFired:(NSTimer *)timer
{
    NSProgress *progress = (NSProgress *)timer.userInfo;
    progress.completedUnitCount ++;
    ZSSImage *image = progress.userInfo[@"image"];
    NSString *imageId = image.imageId;
    if(imageId){
        [self setProgress:progress.fractionCompleted onImage:imageId];
        
        if(progress.fractionCompleted>=1){
            [self replaceLocalImageWithRemoteImage:[[NSURL fileURLWithPath:progress.userInfo[@"url"]] absoluteString] uniqueId:imageId];
            [timer invalidate];
        }
    }
}


@end
