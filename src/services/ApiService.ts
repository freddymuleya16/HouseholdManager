export class ApiService {
    fetchData() {
      return fetch("https://api.example.com/data").then((res) => res.json());
    }
  }
   