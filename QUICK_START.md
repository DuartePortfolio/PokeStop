# PokeStop - Quick Reference

## 🚀 Start the Project

```powershell
cd "c:\Users\alexm\Documents\Ensino superior\Ano3 Semestre1\Serviços e Interfaces para a Cloud\PokeStop"
docker-compose up -d
.\health_check.ps1
```

## 📱 Access Services

| Service | URL |
|---------|-----|
| **Homepage** | http://localhost/ |
| **Register** | http://localhost/register.html |
| **Login** | http://localhost/login.html |
| **GraphQL** | http://localhost:3001/graphql |

## 🛑 Stop the Project

```powershell
docker-compose down
```

## 📊 View Logs

```powershell
docker-compose logs -f           # All services
docker logs -f pokestop-user-service
docker logs -f pokestop-authentication-service
docker logs -f pokestop-encounter-service
```

## 🔧 Rebuild Services

```powershell
docker-compose build
docker-compose up -d
```

---

**All test files, debug code, and redundant documentation have been cleaned up.**  
**The project is clean, optimized, and fully operational.**
