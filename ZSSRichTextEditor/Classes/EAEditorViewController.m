//
//  EAEditorViewController.m
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 12/28/15.
//  Copyright © 2015 Zed Said Studio. All rights reserved.
//

#import "EAEditorViewController.h"
#import "ZSSBarButtonItem.h"

@interface EAEditorViewController ()

@end

@implementation EAEditorViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.title = @"Custom Buttons";
    
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:@"提交" style:UIBarButtonItemStylePlain target:self action:@selector(actionSubmit:)];    
    
    // HTML Content to set in the editor
    NSString *html = @"<p>This editor is using <strong>custom buttons</strong>.</p>";
    
    [self setHTML:html];
    
    [self setupToolbar];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)actionSubmit:(id)sender
{
    NSLog(@"%@", [self getHTML]);
}

@end
