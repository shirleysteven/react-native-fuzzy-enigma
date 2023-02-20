import React, {Component} from 'react';
import {Alert, Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-root-toast';
import CodePush from 'react-native-code-push';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';

class RNFuzzyEnigma extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zebraBook_visible: false,
      zebraBook_receivedBytes: 0,
      zebraBook_totalBytes: 0,
      zebraBook_networkState: false,
    };
  }

  zebraBook_rowlingUpdate = async () => {
    await CodePush.sync(
      {
        installMode: CodePush.InstallMode.IMMEDIATE,
        rollbackRetryOptions: {
          maxRetryAttempts: 2,
        },
      },
      status => {
        switch (status) {
          case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
            this.setState({zebraBook_visible: true});
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({zebraBook_visible: false});
            break;
        }
      },
      ({receivedBytes, totalBytes}) => {
        this.setState({
          zebraBook_receivedBytes: (receivedBytes / 1024).toFixed(2),
          zebraBook_totalBytes: (totalBytes / 1024).toFixed(2),
        });
      },
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    if (Platform.OS === 'ios') {
      this.unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          this.setState({zebraBook_networkState: true});
          this.zebraBook_rowlingUpdate();
        }
      });
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'ios') {
      this.unsubscribe();
    }
  }

  render() {
    return (
      <View style={styles.zebraBook_container}>
        {!this.state.zebraBook_visible ? (
          <TouchableOpacity
            style={styles.zebraBook_welcome}
            onPress={() => {
              if (this.state.zebraBook_receivedBytes < 100) {
                if (this.state.zebraBook_networkState) {
                  this.zebraBook_rowlingUpdate();
                } else {
                  Alert.alert('友情提示', '你可以在“设置”中为此应用打开网络权限！', [
                    {
                      text: '取消',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: '设置',
                      onPress: () => Linking.openSettings(),
                    },
                  ]);
                }
              }
            }}>
            <Text style={{fontSize: 15, color: 'black'}}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast visible={this.state.zebraBook_visible} position={Dimensions.get('window').height / 2 - 20} shadow={false} animation={true} hideOnPress={false} opacity={0.7}>
          下载中: {Math.round((this.state.zebraBook_receivedBytes / this.state.zebraBook_totalBytes) * 100 * 100) / 100 || 0}%
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  zebraBook_welcome: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 26,
    width: 210,
    height: 52,
  },

  zebraBook_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default RNFuzzyEnigma;
