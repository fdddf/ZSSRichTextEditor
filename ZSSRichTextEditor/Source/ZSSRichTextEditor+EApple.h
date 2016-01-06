//
//  ZSSRichTextEditor+EApple.h
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 12/30/15.
//  Copyright © 2015 Zed Said Studio. All rights reserved.
//

#import "ZSSRichTextEditor.h"
#import "ZSSImage.h"


//@class ZSImage;
//@protocol ZSSRichTextEditorDelegate <NSObject>
//
//- (void)needUploadImage:(ZSImage *)image;
//@end

@interface ZSSRichTextEditor (EApple)
@property(nonatomic, strong) NSMutableDictionary *imagesAdded;
//@property(nonatomic, assign) id<ZSSRichTextEditorDelegate> delegate;

- (void)setupToolbar;

- (void)insertLocalImage:(NSString*)url uniqueId:(NSString*)uniqueId;
- (void)replaceLocalImageWithRemoteImage:(NSString*)url uniqueId:(NSString*)uniqueId;
- (void)setProgress:(double) progress onImage:(NSString*)uniqueId;
- (void)markImage:(NSString *)uniqueId failedUploadWithMessage:(NSString*) message;
- (void)unmarkImageFailedUpload:(NSString *)uniqueId;
- (void)removeImage:(NSString*)uniqueId;


- (void)needUploadImage:(ZSSImage *)image;

@end