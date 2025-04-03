/**
 * 地图服务工具类
 * 封装高德地图API的调用
 */
import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图API密钥，实际项目中应该从环境变量获取
const API_KEY = 'f9e5a4f59e2ce2b37e430df0f80d66c3';

export default class MapService {
  static map = null;
  static mapInstance = null;
  
  /**
   * 初始化地图
   * @param {String} container 地图容器ID
   * @returns {Promise} 返回地图实例
   */
  static async initMap(container) {
    if (this.map) {
      return this.map;
    }
    
    try {
      const AMap = await AMapLoader.load({
        key: API_KEY,
        version: '2.0',
        plugins: [
          'AMap.Geolocation',
          'AMap.Geocoder',
          'AMap.CircleEditor',
          'AMap.PolygonEditor',
          'AMap.ToolBar',
          'AMap.Scale'
        ]
      });
      
      this.mapInstance = AMap;
      this.map = new AMap.Map(container, {
        zoom: 13,
        resizeEnable: true
      });
      
      // 添加工具条和比例尺
      this.map.addControl(new AMap.ToolBar());
      this.map.addControl(new AMap.Scale());
      
      return this.map;
    } catch (error) {
      console.error('地图初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取当前位置
   * @returns {Promise} 返回位置信息
   */
  static async getCurrentLocation() {
    if (!this.map) {
      throw new Error('地图未初始化');
    }
    
    return new Promise((resolve, reject) => {
      const geolocation = new this.mapInstance.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        convert: true,
        showButton: false
      });
      
      this.map.addControl(geolocation);
      
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          console.log(result);
          const position = {
            lng: result.position.lng,
            lat: result.position.lat
          };
          resolve({
            position: position,
            accuracy: result.accuracy,
            location: result.location,
            formattedAddress: result.formattedAddress,
            message: '获取位置成功'
          });
        } else {
          reject({
            status,
            message: result.message || '获取位置失败'
          });
        }
      });
    });
  }
  
  /**
   * 创建圆形区域
   * @param {Array} center 圆心坐标 [lng, lat]
   * @param {Number} radius 半径，单位：米
   * @param {Object} options 圆形样式选项
   * @returns {Object} 圆形对象
   */
  static createCircle(center, radius, options = {}) {
    if (!this.map) {
      throw new Error('地图未初始化');
    }
    
    const defaultOptions = {
      strokeColor: '#FF33FF',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: '#1791fc',
      fillOpacity: 0.2,
      strokeStyle: 'solid',
      extData: {}
    };
    
    const circle = new this.mapInstance.Circle({
      center: new this.mapInstance.LngLat(center[0], center[1]),
      radius,
      ...defaultOptions,
      ...options
    });
    
    this.map.add(circle);
    return circle;
  }
  
  /**
   * 创建标记点
   * @param {Array} position 位置坐标 [lng, lat]
   * @param {Object} options 标记点选项
   * @returns {Object} 标记点对象
   */
  static createMarker(position, options = {}) {
    if (!this.map) {
      throw new Error('地图未初始化');
    }
    
    const marker = new this.mapInstance.Marker({
      position: new this.mapInstance.LngLat(position[0], position[1]),
      title: options.title || '',
      icon: options.icon,
      extData: options.extData || {}
    });
    
    this.map.add(marker);
    return marker;
  }
  
  /**
   * 计算两点之间的距离
   * @param {Array} point1 第一个点的坐标 [lng, lat]
   * @param {Array} point2 第二个点的坐标 [lng, lat]
   * @returns {Number} 距离，单位：米
   */
  static calculateDistance(point1, point2) {
    if (!this.mapInstance) {
      throw new Error('地图未初始化');
    }
    
    const lnglat1 = new this.mapInstance.LngLat(point1[0], point1[1]);
    const lnglat2 = new this.mapInstance.LngLat(point2[0], point2[1]);
    
    return lnglat1.distance(lnglat2);
  }
  
  /**
   * 判断点是否在圆内
   * @param {Array} point 点坐标 [lng, lat]
   * @param {Array} circleCenter 圆心坐标 [lng, lat]
   * @param {Number} radius 圆半径，单位：米
   * @returns {Boolean} 是否在圆内
   */
  static isPointInCircle(point, circleCenter, radius) {
    const distance = this.calculateDistance(point, circleCenter);
    return distance <= radius;
  }
  
  /**
   * 地址解析（地址转坐标）
   * @param {String} address 地址
   * @returns {Promise} 返回坐标信息
   */
  static async geocoder(address) {
    if (!this.mapInstance) {
      throw new Error('地图未初始化');
    }
    
    return new Promise((resolve, reject) => {
      const geocoder = new this.mapInstance.Geocoder();
      
      geocoder.getLocation(address, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          resolve(result.geocodes[0]);
        } else {
          reject({
            status,
            message: result.info || '地址解析失败'
          });
        }
      });
    });
  }
  
  /**
   * 逆地址解析（坐标转地址）
   * @param {Array} location 位置坐标 [lng, lat]
   * @returns {Promise} 返回地址信息
   */
  static async reverseGeocoder(location) {
    if (!this.mapInstance) {
      throw new Error('地图未初始化');
    }
    
    return new Promise((resolve, reject) => {
      const geocoder = new this.mapInstance.Geocoder();
      
      geocoder.getAddress(location, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          resolve(result.regeocode);
        } else {
          reject({
            status,
            message: result.info || '逆地址解析失败'
          });
        }
      });
    });
  }
  
  /**
   * 清除地图上的所有覆盖物
   */
  static clearMap() {
    if (this.map) {
      this.map.clearMap();
    }
  }
  
  /**
   * 销毁地图实例
   */
  static destroyMap() {
    if (this.map) {
      this.map.destroy();
      this.map = null;
      this.mapInstance = null;
    }
  }

  /**
   * 在地图上显示当前位置
   * @param {Object} map 地图实例
   * @param {Array} position 位置坐标 [lng, lat]
   * @returns {Object} 标记点对象
   */
  static showCurrentLocation(map, position) {
    if (!map || !position) {
      throw new Error('参数错误');
    }

    // 验证经纬度的有效性
    let lng, lat;
    
    if (Array.isArray(position)) {
      lng = parseFloat(position[0]);
      lat = parseFloat(position[1]);
    } else if (typeof position === 'object') {
      lng = parseFloat(position.lng);
      lat = parseFloat(position.lat);
    } else {
      throw new Error('无效的位置参数格式');
    }

    if (isNaN(lng) || isNaN(lat)) {
      throw new Error('无效的经纬度坐标');
    }

    // 创建当前位置的标记
    const marker = new this.mapInstance.Marker({
      position: new this.mapInstance.LngLat(lng, lat),
      icon: new this.mapInstance.Icon({
        size: new this.mapInstance.Size(25, 34),
        imageSize: new this.mapInstance.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png'
      }),
      offset: new this.mapInstance.Pixel(-13, -34)
    });

    map.add(marker);
    map.setCenter([lng, lat]);
    return marker;
  }

  /**
   * 显示打卡范围
   * @param {Object} map 地图实例
   * @param {Array} center 圆心坐标 [lng, lat]
   * @param {Number} radius 半径，单位：米
   */
  static showCheckinRange(map, center, radius) {
    if (!map || !center || !radius) {
      throw new Error('参数错误');
    }

    const circle = this.createCircle(center, radius);
    map.setFitView([circle]);
  }

  /**
   * 显示位置区域
   * @param {Object} map 地图实例
   * @param {Array} points 多边形顶点坐标数组
   */
  static showLocationArea(map, points) {
    if (!map || !points || !points.length) {
      throw new Error('参数错误');
    }

    const polygon = new this.mapInstance.Polygon({
      path: points.map(point => new this.mapInstance.LngLat(point[0], point[1])),
      strokeColor: '#FF33FF',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: '#1791fc',
      fillOpacity: 0.2
    });

    map.add(polygon);
    map.setFitView([polygon]);
  }
}