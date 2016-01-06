//
//  ZSSImage.h
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 1/5/16.
//  Copyright © 2016 Zed Said Studio. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface ZSSImage : NSObject
@property(nonatomic, strong) NSString *imageId;
@property(nonatomic, strong) NSString *localPath;
@property(nonatomic, strong) NSString *remotePath;
@end
