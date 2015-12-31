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

@implementation ZSSRichTextEditor (EApple)
@dynamic localImages;

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
    
    self.localImages = [NSMutableArray array];
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
    NSData *imageData = UIImagePNGRepresentation(orginalImage);
    ;
    NSString *imageId = [[NSUUID UUID] UUIDString];
    NSString *filename = [NSString stringWithFormat:@"%@.png", imageId];
    
    NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:filename];
    [imageData writeToFile:path atomically:YES];
    
    NSURL *fileUrl = [NSURL fileURLWithPath:path];
    
    //    NSURL *url = [info objectForKey:UIImagePickerControllerReferenceURL];
    [self.localImages addObject:fileUrl.absoluteString];
    [self insertImage:fileUrl.absoluteString alt:@""];
}


@end
