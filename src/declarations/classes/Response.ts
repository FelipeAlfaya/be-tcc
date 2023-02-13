class ServerResponse<T> {
  data: T;
  success: boolean;

  constructor(data: T) {
    this.data = data;
    this.success = data instanceof Error ? false : true;
  }
}

export default ServerResponse;
