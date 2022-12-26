import React, {Component} from 'react';
import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-root-toast';
import CodePush from 'react-native-code-push';
import NetInfo from '@react-native-community/netinfo';
import SplashScreen from 'react-native-splash-screen';

class RNFuzzyEnigma extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fuzzy_visible: false,
      fuzzy_receivedBytes: 0,
      fuzzy_totalBytes: 0,
    };
  }

  fuzzy_rowlingUpdate = async () => {
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
            this.setState({fuzzy_visible: true});
            break;
          case CodePush.SyncStatus.INSTALLING_UPDATE:
            this.setState({fuzzy_visible: false});
            break;
        }
      },
      ({receivedBytes, totalBytes}) => {
        this.setState({
          fuzzy_receivedBytes: (receivedBytes / 1024).toFixed(2),
          fuzzy_totalBytes: (totalBytes / 1024).toFixed(2),
        });
      },
    );
  };

  componentDidMount() {
    SplashScreen.hide();

    this.unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        this.fuzzy_rowlingUpdate();
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <View style={styles.fuzzy_container}>
        {!this.state.fuzzy_visible ? (
          <TouchableOpacity
            style={styles.fuzzy_welcome}
            onPress={() => {
              if (this.state.fuzzy_receivedBytes < 100) {
                this.fuzzy_rowlingUpdate();
              }
            }}>
            <Text style={{fontSize: 15, color: 'black'}}>获取最新版本</Text>
          </TouchableOpacity>
        ) : null}
        <Toast visible={this.state.fuzzy_visible} position={Dimensions.get('window').height / 2 - 20} shadow={false} animation={true} hideOnPress={false} opacity={0.7}>
          下载中: {Math.round((this.state.fuzzy_receivedBytes / this.state.fuzzy_totalBytes) * 100 * 100) / 100 || 0}%
        </Toast>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fuzzy_welcome: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 26,
    width: 210,
    height: 52,
  },

  fuzzy_container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default RNFuzzyEnigma;
