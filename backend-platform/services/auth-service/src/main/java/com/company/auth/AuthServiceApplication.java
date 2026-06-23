@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request) {

        // TODO:
        // Validate user from DB

        String token =
                jwtService.generateToken(
                        request.getEmail());

        return new AuthResponse(token);
    }
}
