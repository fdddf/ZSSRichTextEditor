//
//  ZSSRichTextEditor+EApple.h
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 12/30/15.
//  Copyright © 2015 Zed Said Studio. All rights reserved.
//

#import "ZSSRichTextEditor.h"

@interface ZSSRichTextEditor (EApple)
@property(nonatomic, strong) NSMutableArray *localImages;

- (void)setupToolbar;
@end
