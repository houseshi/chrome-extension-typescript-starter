import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Button, Layout, List, Progress, Row, Col, Upload, message, Space } from 'antd';
import { UploadOutlined , MinusCircleOutlined} from '@ant-design/icons';
import 'antd/dist/antd.less'
import './less/popup.less'
import FileMoudle from "./FileMoudle";

const { Footer, Content } = Layout;
export default class Popup extends Component {
  state = { files: [] }
  componentDidMount() {
    let self = this
    chrome.storage.local.get({ files: false }, item=>{
      if(item.files != false){
        self.setState({files:item.files})
      }
    });
  }

  addBooks = (e: any) => {
    let f: File = e.file.originFileObj
    const { files } = this.state;
    const reder = new FileReader()
    reder.readAsArrayBuffer(f)
    reder.onload = (e: any) => {
        let byte = e.target.result
        let arr = Array.prototype.slice.call(new Uint8Array(byte));
        const file = {
          name:f.name,
          key:f.size,
          bold: arr,
          rate: 0.00,
          active:false
        }
        const newBooks = [file, ...files]
        this.setState({ files: newBooks })
        chrome.storage.local.set({ files: newBooks }, function () {
          console.log(newBooks)
          console.log("保存成功")
        });
    }
  }
  removeBooks = (id:number) => {
    const {files} = this.state 
    const newFiles=  files.filter( (file:FileMoudle) =>{
      if(id !== file.key){
          return file
      }
    })
    this.setState({files:newFiles});
  }
  readBook =(id:number):void =>{
    const { files } = this.state;
    const newFs = files.map( (f:FileMoudle) =>{
      if(f.key == id){
        f.active = true
      }
      return f
    })
    this.setState({files:newFs})
    chrome.storage.local.set({ files: newFs });
    chrome.runtime.sendMessage(id)
  }
  render() {
    const { files } = this.state;
    return (
      <Layout style={{ background: "rgb(255 255 255)", width: "300px" }}>
        <Content>
          <Row>
            <Col span={2} />
            <Col span={20} >
              <List itemLayout="horizontal">
                {
                  files.map( (file:FileMoudle) => {
                    return (
                      <div key={file.key}>
                        <List.Item >
                          <List.Item.Meta
                            // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                           title={<span className="hover" onClick={()=>this.readBook(file.key)} >{file.name}</span>} />
                            <MinusCircleOutlined onClick={()=>this.removeBooks(file.key) }/>
                        </List.Item>
                        <div style={{ width: 220 }}>
                          <Progress percent={file.rate} size="small" />
                        </div>
                      </div>
                    )
                  })
                }
              </List>
            </Col>
            <Col span={2} />
          </Row>
        </Content>
        <Footer>
          {/* accept="application/epub+zip  , text/plain" */}
            <Upload  showUploadList={false}
             accept="application/epub+zip" onChange={(info) => {
              if (info.file.status === 'done') {
                // message.success(`${info.file.name} file uploaded successfully`);
                this.addBooks(info);
              }
            }}>
              <Button icon={<UploadOutlined />}>添加新书</Button>
            </Upload>
        </Footer>
      </Layout >
    )
  }
}
ReactDOM.render(
  <Popup />,
  document.getElementById("root")
);


