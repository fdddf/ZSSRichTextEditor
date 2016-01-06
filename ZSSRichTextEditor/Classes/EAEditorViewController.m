//
//  EAEditorViewController.m
//  ZSSRichTextEditor
//
//  Created by Yongliang Wang on 12/28/15.
//  Copyright © 2015 Zed Said Studio. All rights reserved.
//

#import "EAEditorViewController.h"
#import "ZSSBarButtonItem.h"

@interface EAEditorViewController ()<NSURLSessionDelegate, NSURLSessionTaskDelegate>
@property(nonatomic, strong) NSMutableDictionary *imageUploadTasks;
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
    
    self.imageUploadTasks = [NSMutableDictionary new];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)actionSubmit:(id)sender
{
    NSLog(@"%@", [self getHTML]);
}

- (void)needUploadImage:(ZSSImage *)image
{
    NSLog(@"want upload image : %@", image.localPath);
    
    NSData *data = [[NSData alloc] initWithContentsOfFile:image.localPath];
    NSURLRequest *req = [self postRequestWithURL:@"http://117.34.109.42:8088/sfb_server_sqlserver_v2/uploadcontroller/upload.htm" data:data fileName:[image.localPath lastPathComponent] fieldName:@"file"];
    
//    [NSURLConnection sendAsynchronousRequest:req queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse * _Nullable response, NSData * _Nullable data, NSError * _Nullable connectionError) {
//        NSString *resp = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
//        NSLog(@"%@", resp);
//        
//        NSError *error = nil;
//        NSDictionary *ret = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:&error];
//        if(ret && ret[@"status"]){
//            NSString *remotePath = [NSString stringWithFormat:@"http://117.34.109.42:8088/sfb_server_sqlserver_v2/%@", ret[@"result"]];
//            
//            NSLog(@"%@", remotePath);
//            [self replaceLocalImageWithRemoteImage:remotePath uniqueId:image.imageId];
//        }
//
//    }];
    
    
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    NSURLSession *session = [NSURLSession sessionWithConfiguration:configuration delegate:self delegateQueue:nil];

    NSURLSessionDataTask *postTask = [session dataTaskWithRequest:req completionHandler:^(NSData * _Nullable data, NSURLResponse * _Nullable response, NSError * _Nullable error) {
        NSString *resp = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        NSLog(@"%@", resp);
        
        NSError *err = nil;
        NSDictionary *ret = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:&err];
        if(ret && ret[@"status"]){
            NSString *remotePath = [NSString stringWithFormat:@"http://117.34.109.42:8088/sfb_server_sqlserver_v2/%@", ret[@"result"]];
            
            NSLog(@"%@", remotePath);
            dispatch_async(dispatch_get_main_queue(), ^{
                [self replaceLocalImageWithRemoteImage:remotePath uniqueId:image.imageId];
            });
        }
    }];
    self.imageUploadTasks[image.imageId] = postTask;
    [postTask resume];
}

-(NSURLRequest *)postRequestWithURL:(NSString *)url
                               data:(NSData *)data
                           fileName:(NSString*)fileName
                          fieldName:(NSString *)fieldName
{

    NSMutableURLRequest *urlRequest = [[NSMutableURLRequest alloc] init];
    [urlRequest setURL:[NSURL URLWithString:url]];
    [urlRequest setHTTPMethod:@"POST"];
    
    NSString *myboundary = @"---------------------------14737809831466499882746641449";
    NSString *contentType = [NSString stringWithFormat:@"multipart/form-data; boundary=%@",myboundary];
    [urlRequest addValue:contentType forHTTPHeaderField: @"Content-Type"];
    
    NSMutableData *postData = [NSMutableData data]; //[NSMutableData dataWithCapacity:[data length] + 512];
    [postData appendData:[[NSString stringWithFormat:@"\r\n--%@\r\n", myboundary] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[[NSString stringWithFormat:@"Content-Disposition: form-data; name=\"%@\"; filename=\"%@\"\r\n", fieldName, fileName] dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[@"Content-Type: application/octet-stream\r\n\r\n" dataUsingEncoding:NSUTF8StringEncoding]];
    [postData appendData:[NSData dataWithData:data]];
    [postData appendData:[[NSString stringWithFormat:@"\r\n--%@--\r\n", myboundary] dataUsingEncoding:NSUTF8StringEncoding]];
    
    [urlRequest setHTTPBody:postData];
    return urlRequest;
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
   didSendBodyData:(int64_t)bytesSent
    totalBytesSent:(int64_t)totalBytesSent
totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend
{
//    NSLog(@"didSendBodyData   %lli, %lli, %lli \n", bytesSent, totalBytesSent, totalBytesExpectedToSend);
    double_t progress = (double_t)totalBytesSent/(double_t)totalBytesExpectedToSend;
    
    [self.imageUploadTasks enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        if([obj isEqual:task]){
            dispatch_async(dispatch_get_main_queue(), ^{
                [self setProgress:progress onImage:key];
            });
            *stop = YES;
        }
    }];
}

//- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
//didCompleteWithError:(nullable NSError *)error
//{
//    NSLog(@"%@", error);
//    NSURLResponse *resp = task.response;
//}
//
//- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask
//didReceiveResponse:(NSURLResponse *)response
// completionHandler:(void (^)(NSURLSessionResponseDisposition disposition))completionHandler
//{
//    NSLog(@"%@", response.URL);
//}

@end
