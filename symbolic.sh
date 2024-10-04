# GameServer
ln -sf "$(pwd)/network/Netbase" "$(pwd)/Server/GameServer/src/Netbase"
ln -sf "$(pwd)/network/Netcommon" "$(pwd)/Server/GameServer/src/Netcommon"
ln -sf "$(pwd)/network/NetProtocol" "$(pwd)/Server/GameServer/src/NetProtocol"
ln -sf "$(pwd)/Server/Netservice" "$(pwd)/Server/GameServer/src/Netservice"

# goplay
ln -sf "$(pwd)/network/Netbase" "$(pwd)/goplay/src/views/H5/Net/Netbase"
ln -sf "$(pwd)/network/Netcommon" "$(pwd)/goplay/src/views/H5/Net/Netcommon"
ln -sf "$(pwd)/network/NetProtocol" "$(pwd)/goplay/src/views/H5/Net/NetProtocol"

# Bot
ln -sf "$(pwd)/network/Netbase" "$(pwd)/Bot/src/Netbase"
ln -sf "$(pwd)/network/Netcommon" "$(pwd)/Bot/src/Netcommon"
ln -sf "$(pwd)/network/NetProtocol" "$(pwd)/Bot/src/NetProtocol"
ln -sf "$(pwd)/goplay/src/views/H5/Net/NetClient" "$(pwd)/Bot/src/NetClient"